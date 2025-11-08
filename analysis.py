import base64
import os
from io import BytesIO
from typing import Iterable, List, Sequence

import matplotlib
import matplotlib.dates as mdates
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
import pandas as pd

matplotlib.use('Agg')  # Use non-interactive backend


def generate_dashboard(trip_sources):
    """Handles data manipulation using pandas and creates all necessary charts using matplotlib.

    Args:
        trip_sources: Path to a CSV file or an iterable containing paths/metadata for multiple CSV files.

    Returns:
        dict: Trip data containing combined trip info, per-dataset summaries, and base64 images for charts.
    """
    normalized_sources = _normalize_trip_sources(trip_sources)

    datasets = []
    for source in normalized_sources:
        path = source['path']
        label = source['label']
        try:
            df = pd.read_csv(path)
        except Exception:
            continue
        df = wrangle_df(df)
        datasets.append({'label': label, 'df': df})

    if not datasets:
        return {
            'trip_info': {},
            'datasets': [],
            'rpm_img': generate_empty_chart("No RPM data available"),
            'ideal_speed_img': generate_empty_chart("No speed data available"),
            'acc_img': generate_empty_chart("No acceleration data available"),
            'rpm_throttle': generate_empty_chart("No RPM/Throttle data available")
        }

    combined_df = pd.concat([entry['df'] for entry in datasets], ignore_index=True)
    if 'time' in combined_df.columns:
        combined_df = combined_df.sort_values('time')

    trip_info = get_trip_info(combined_df)
    dataset_summaries = [{
        'label': entry['label'],
        'trip_info': get_trip_info(entry['df'])
    } for entry in datasets]

    rpm_img = plot_rpm(datasets)
    ideal_speed_img = plot_ideal_speed(datasets)
    acc_img = plot_acceleration(datasets)
    rpm_throttle = hexbin_rpm_throttle(datasets)

    return {
        'trip_info': trip_info,
        'datasets': dataset_summaries,
        'rpm_img': rpm_img,
        'ideal_speed_img': ideal_speed_img,
        'acc_img': acc_img,
        'rpm_throttle': rpm_throttle
    }


def _normalize_trip_sources(trip_sources) -> List[dict]:
    if not trip_sources:
        return []

    if isinstance(trip_sources, (str, os.PathLike)):
        trip_sources = [trip_sources]
    elif isinstance(trip_sources, dict):
        trip_sources = [trip_sources]

    normalized = []
    for item in trip_sources:
        path = None
        label = None
        if isinstance(item, dict):
            path = item.get('path') or item.get('filepath') or item.get('file')
            label = item.get('label') or item.get('name')
        elif isinstance(item, Sequence) and item:
            path = item[0]
            label = item[1] if len(item) > 1 else None
        else:
            path = item

        if not path:
            continue

        path_str = str(path)
        label_str = str(label) if label else os.path.basename(path_str)
        normalized.append({'path': path_str, 'label': label_str})

    return normalized


def wrangle_df(df) -> pd.DataFrame:
    """Data wrangling: clean and transform the raw csv data

    Args:
        df (DataFrame): dataframe from input csv

    Returns:
        pd.DataFrame: cleaned up dataframe
    """
    # convert time to pandas datetime
    if 'time' in df.columns:
        df['time'] = pd.to_datetime(df['time'], errors='coerce')

    # remove any unnamed columns
    for col in list(df.columns):
        if 'Unnamed' in col:
            df.drop(col, axis=1, inplace=True)

    # forward/backward fill for missing values
    df = df.ffill().bfill()

    return df


def get_trip_info(df: pd.DataFrame) -> dict:
    """Extract trip information from dataframe (converted to Indian standards)

    Args:
        df (pd.DataFrame): Cleaned dataframe

    Returns:
        dict: Trip information in Indian units (km, km/l, liters)
    """
    def safe_value(column_name: str, *, mode: str = 'last'):
        if column_name not in df.columns:
            return None
        series = df[column_name].dropna()
        if series.empty:
            return None
        if mode == 'mean':
            return series.mean()
        if mode == 'max':
            return series.max()
        try:
            return series.iloc[-1]
        except Exception:
            return None

    distance_miles = safe_value('Distance travelled (miles)', mode='max')
    if distance_miles is None:
        distance_miles = safe_value('Distance travelled (trip) (miles)', mode='max')
    distance_miles = float(distance_miles or 0)
    distance_km = distance_miles * 1.60934

    duration_minutes = 0
    if 'time' in df.columns:
        time_series = df['time'].dropna()
        if not time_series.empty:
            try:
                duration_minutes = int((time_series.iloc[-1] - time_series.iloc[0]).total_seconds() / 60)
            except Exception:
                duration_minutes = 0

    avg_mpg = safe_value('Average fuel consumption (total) (MPG)', mode='last')
    if avg_mpg is None:
        avg_mpg = safe_value('Average fuel consumption (MPG)', mode='mean')
    if avg_mpg is None:
        avg_mpg = 0
    avg_kmpl = float(avg_mpg) * 0.425144 if avg_mpg else 0

    avg_speed_mph = safe_value('Average speed (mph)', mode='last')
    if avg_speed_mph is None:
        avg_speed_mph = safe_value('Vehicle speed (mph)', mode='mean')
    if avg_speed_mph is None:
        avg_speed_mph = 0
    avg_speed_kmh = float(avg_speed_mph) * 1.60934 if avg_speed_mph else 0

    fuel_gallons = safe_value('Fuel used (gallon)', mode='last')
    if fuel_gallons is None:
        fuel_gallons = safe_value('Fuel used (total) (gallon)', mode='last')
    if fuel_gallons is None:
        fuel_gallons = safe_value('Fuel used (trip) (gallon)', mode='max')
    if fuel_gallons is None:
        fuel_gallons = 0
    fuel_liters = float(fuel_gallons) * 3.78541 if fuel_gallons else 0

    return {
        'distance_miles': round(distance_miles, 2),
        'distance_km': round(distance_km, 2),
        'duration_minutes': duration_minutes,
        'avg_mpg': round(float(avg_mpg), 2) if avg_mpg else 0,
        'avg_kmpl': round(avg_kmpl, 2) if avg_kmpl else 0,
        'avg_speed_mph': round(float(avg_speed_mph), 2) if avg_speed_mph else 0,
        'avg_speed_kmh': round(avg_speed_kmh, 2) if avg_speed_kmh else 0,
        'fuel_consumed_gallons': round(float(fuel_gallons), 2) if fuel_gallons else 0,
        'fuel_consumed_liters': round(fuel_liters, 2) if fuel_liters else 0
    }


def plot_rpm(datasets: Iterable[dict]) -> str:
    """Plot Engine RPM over time for single or multiple datasets."""
    valid_entries = []
    for entry in datasets:
        df = entry['df']
        if 'time' not in df.columns or 'Engine RPM (rpm)' not in df.columns:
            continue
        subset = df[['time', 'Engine RPM (rpm)']].dropna()
        if subset.empty:
            continue
        valid_entries.append((entry['label'], subset))

    if not valid_entries:
        return generate_empty_chart("No RPM data available")

    fig = Figure(figsize=(8, 5))
    ax = fig.subplots()

    colors = _get_palette()
    y_min = None
    y_max = None

    for idx, (label, subset) in enumerate(valid_entries):
        color = colors[idx % len(colors)]
        subset = subset.sort_values('time')
        ax.plot(subset['time'], subset['Engine RPM (rpm)'], color=color, linewidth=1.8, label=label)
        series_min = float(subset['Engine RPM (rpm)'].min())
        series_max = float(subset['Engine RPM (rpm)'].max())
        y_min = series_min if y_min is None else min(y_min, series_min)
        y_max = series_max if y_max is None else max(y_max, series_max)

    if y_min is None or y_max is None:
        return generate_empty_chart("No RPM data available")

    ax.set_xlabel('Time')
    ax.set_ylabel('Engine RPM (rpm)')
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))

    idling = 1000
    high_revs = 5000
    ideal_rpm = 2500

    ax.axhline(y=idling, color='#ea580c', linestyle='--', linewidth=1)
    ax.axhline(y=ideal_rpm, color='#16a34a', linestyle='--', linewidth=1)
    ax.axhline(y=high_revs, color='#dc2626', linestyle='--', linewidth=1)

    ax.axhspan(y_min, idling, facecolor='#fed7aa', alpha=0.18)
    ax.axhspan(idling, high_revs, facecolor='#bbf7d0', alpha=0.18)
    ax.axhspan(high_revs, y_max, facecolor='#fecaca', alpha=0.18)

    if len(valid_entries) > 1:
        ax.legend(frameon=False, loc='upper right')

    ax.grid(True, alpha=0.3)

    return generate_image(fig)


def plot_ideal_speed(datasets: Iterable[dict]) -> str:
    """Plot vehicle speed over time with speed zones (rendered in km/h)."""
    valid_entries = []
    for entry in datasets:
        df = entry['df']
        if 'time' not in df.columns:
            continue
        if 'Vehicle speed (mph)' in df.columns:
            subset = df[['time', 'Vehicle speed (mph)']].dropna()
        elif 'Speed (GPS) (mph)' in df.columns:
            subset = df[['time', 'Speed (GPS) (mph)']].dropna()
            subset = subset.rename(columns={'Speed (GPS) (mph)': 'Vehicle speed (mph)'})
        else:
            continue
        if subset.empty:
            continue
        subset['Vehicle speed (km/h)'] = subset['Vehicle speed (mph)'].astype(float) * 1.60934
        valid_entries.append((entry['label'], subset))

    if not valid_entries:
        return generate_empty_chart("No speed data available")

    fig = Figure(figsize=(8, 5))
    ax = fig.subplots()
    colors = _get_palette()

    ymax = None
    for idx, (label, subset) in enumerate(valid_entries):
        color = colors[idx % len(colors)]
        subset = subset.sort_values('time')
        ax.plot(subset['time'], subset['Vehicle speed (km/h)'], color=color, linewidth=1.8, label=label)
        series_max = float(subset['Vehicle speed (km/h)'].max())
        ymax = series_max if ymax is None else max(ymax, series_max)

    ax.set_xlabel('Time')
    ax.set_ylabel('Vehicle speed (km/h)')
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))

    ideal_speed = 80  # Approx. 50 mph expressed in km/h
    if ymax is None:
        ymax = ideal_speed
    ax.axhline(y=ideal_speed, color='#16a34a', linestyle='--', linewidth=1)
    ax.axhspan(0, ideal_speed, facecolor='#bbf7d0', alpha=0.18)
    if ymax > ideal_speed:
        ax.axhspan(ideal_speed, ymax, facecolor='#fecaca', alpha=0.18)

    if len(valid_entries) > 1:
        ax.legend(frameon=False, loc='upper right')

    ax.grid(True, alpha=0.3)

    return generate_image(fig)


def plot_acceleration(datasets: Iterable[dict]) -> str:
    """Plot vehicle acceleration over time for one or more datasets."""
    valid_entries = []
    for entry in datasets:
        df = entry['df']
        if 'time' not in df.columns or 'Vehicle acceleration (g)' not in df.columns:
            continue
        subset = df[['time', 'Vehicle acceleration (g)']].dropna()
        if subset.empty:
            continue
        valid_entries.append((entry['label'], subset))

    if not valid_entries:
        return generate_empty_chart("No acceleration data available")

    fig = Figure(figsize=(8, 5))
    ax = fig.subplots()
    colors = _get_palette()

    ymin = None
    ymax = None
    for idx, (label, subset) in enumerate(valid_entries):
        color = colors[idx % len(colors)]
        subset = subset.sort_values('time')
        ax.scatter(
            subset['time'],
            subset['Vehicle acceleration (g)'],
            s=10,
            c=color,
            alpha=0.65,
            label=label,
            edgecolors='none'
        )
        series_min = float(subset['Vehicle acceleration (g)'].min())
        series_max = float(subset['Vehicle acceleration (g)'].max())
        ymin = series_min if ymin is None else min(ymin, series_min)
        ymax = series_max if ymax is None else max(ymax, series_max)

    ax.set_xlabel('Time')
    ax.set_ylabel('Vehicle acceleration (g)')
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))

    coasting = 0
    if ymin is None or ymax is None:
        ymin, ymax = -0.5, 0.5
    ax.axhline(y=coasting, color='#94a3b8', linestyle='--', linewidth=1)
    ax.axhspan(ymin, coasting - 0.1, facecolor='#fecaca', alpha=0.18)
    ax.axhspan(coasting - 0.1, coasting + 0.1, facecolor='#bbf7d0', alpha=0.18)
    ax.axhspan(coasting + 0.1, ymax, facecolor='#fed7aa', alpha=0.18)

    if len(valid_entries) > 1:
        ax.legend(frameon=False, loc='upper right')

    ax.grid(True, alpha=0.3)

    return generate_image(fig)


def hexbin_rpm_throttle(datasets: Iterable[dict]) -> str:
    """Create combined scatter density plot of RPM vs Throttle Position."""
    rpm_series = []
    throttle_series = []
    for entry in datasets:
        df = entry['df']
        if 'Engine RPM (rpm)' not in df.columns:
            continue
        throttle_column = None
        if 'Throttle position (%)' in df.columns:
            throttle_column = 'Throttle position (%)'
        elif 'Throttle Position (%)' in df.columns:
            throttle_column = 'Throttle Position (%)'
        if not throttle_column:
            continue
        subset = df[['Engine RPM (rpm)', throttle_column]].dropna()
        if subset.empty:
            continue
        subset = subset.rename(columns={throttle_column: 'Throttle position (%)'})
        rpm_series.append(subset['Engine RPM (rpm)'])
        throttle_series.append(subset['Throttle position (%)'])

    if not rpm_series or not throttle_series:
        return generate_empty_chart("No RPM/Throttle data available")

    rpm = pd.concat(rpm_series)
    throttle = pd.concat(throttle_series)

    fig = Figure(figsize=(8, 7))
    ax = fig.subplots()

    hexbin = ax.hexbin(rpm, throttle, gridsize=20, cmap='YlOrRd', mincnt=1)
    ax.set_xlabel('Engine RPM (rpm)')
    ax.set_ylabel('Throttle Position (%)')
    ax.grid(True, alpha=0.25)

    cb = fig.colorbar(hexbin, ax=ax)
    cb.set_label('Frequency')

    return generate_image(fig)


def generate_image(fig) -> str:
    """Convert matplotlib figure to base64 encoded string

    Args:
        fig: Matplotlib figure

    Returns:
        str: Base64 encoded image string
    """
    buf = BytesIO()
    fig.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='white')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close(fig)
    return f"data:image/png;base64,{img_str}"


def generate_empty_chart(message: str) -> str:
    """Generate an empty chart with a message

    Args:
        message (str): Message to display

    Returns:
        str: Base64 encoded image string
    """
    fig = Figure(figsize=(8, 5))
    ax = fig.subplots()
    ax.text(0.5, 0.5, message, ha='center', va='center', fontsize=14, color='gray')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    return generate_image(fig)


def _get_palette() -> List[str]:
    return ['#38bdf8', '#22c55e', '#f97316', '#a855f7', '#f43f5e', '#14b8a6', '#eab308']
