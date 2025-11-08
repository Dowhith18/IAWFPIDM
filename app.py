from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os
from werkzeug.utils import secure_filename
# Import generate_dashboard lazily to avoid hard dependency at startup (pandas/numpy binary issues on some systems)

import uuid

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'  # Change this to a random secret key

# Upload configuration
ROOT_DIR = app.root_path
UPLOAD_FOLDER = os.path.join(ROOT_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Load the DTC data from the JSON file
with open('dtc_data.json', 'r', encoding='utf-8') as f:
    dtc_data = json.load(f)
    # Also get a sorted list of all codes for the sidebar
    all_dtc_codes = sorted(list(dtc_data.keys()))


def derive_dtc_metadata(code, data):
    """Derive description, system, and severity metadata for a DTC code."""
    description = "Diagnostic Trouble Code"
    for key in data.keys():
        if any(word in key.upper() for word in ['MAF', 'TEMPERATURE', 'SIGNAL', 'SENSOR', 'PUMP', 'RELAY',
                                                'VALVE', 'ENGINE', 'FUEL', 'CATALYST', 'INTAKE', 'EXHAUST',
                                                'MISFIRE', 'PRESSURE']):
            description = key
            break

    system = "Engine Management"
    if code.startswith('P0') and len(code) > 2:
        system = "Fuel System" if code[2] in ['1', '2'] else "Air Intake System" if code[2] in ['0'] else "Emissions"
    elif code.startswith('P01'):
        system = "Fuel System"
    elif code.startswith('P02'):
        system = "Air Intake System"
    elif code.startswith('P03'):
        system = "Ignition System"
    elif code.startswith('P04'):
        system = "Emissions"
    elif code.startswith('P06'):
        system = "Fuel System"
    elif code.startswith('C'):
        system = "Chassis/ABS"
    elif code.startswith('B'):
        system = "Body Control"
    elif code.startswith('U'):
        system = "Network/Communication"

    data_str = str(data).upper()
    severity = "Medium"
    if any(word in data_str for word in ['CRITICAL', 'SEVERE', 'ENGINE SHUTDOWN', 'CATALYST', 'DAMAGE']):
        severity = "High"
    elif any(word in data_str for word in ['SENSOR', 'SIGNAL', 'CIRCUIT', 'RANGE', 'PERFORMANCE']):
        severity = "Medium"
    else:
        severity = "Low"

    return {
        'description': description,
        'system': system,
        'severity': severity
    }


dtc_metadata = {code: derive_dtc_metadata(code, dtc_data[code]) for code in all_dtc_codes}

# Simple user database (in production, use a real database)
USERS = {
    'admin': {'password': 'admin123', 'role': 'admin'},
    'technician': {'password': 'tech123', 'role': 'technician'},
    'viewer': {'password': 'view123', 'role': 'viewer'}
}

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handles user login."""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        role = request.form.get('role')
        
        # Check credentials
        if username in USERS and USERS[username]['password'] == password:
            session['user'] = username
            session['role'] = USERS[username]['role']
            session['vehicle_selected'] = False  # Reset vehicle selection on new login
            return redirect(url_for('vehicle_selection'))
        else:
            return render_template('login.html', error='Invalid username or password')
    
    # If already logged in, redirect to vehicle selection
    if 'user' in session:
        return redirect(url_for('vehicle_selection'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Handles user logout."""
    session.pop('user', None)
    session.pop('role', None)
    session.pop('vehicle_selected', None)
    return redirect(url_for('login'))

@app.route('/')
def index():
    """Renders the home page with dashboard."""
    # Check if user is logged in
    if 'user' not in session:
        return redirect(url_for('login'))
    
    return render_template('index.html', dtc_codes=all_dtc_codes, user=session.get('user'), role=session.get('role'))

@app.route('/vehicle')
def vehicle_selection():
    """Renders the vehicle selection page."""
    if 'user' not in session:
        return redirect(url_for('login'))

    selected_vehicle = None
    if session.get('vehicle_vin') or session.get('vehicle_model'):
        selected_vehicle = {
            'vin': session.get('vehicle_vin'),
            'model': session.get('vehicle_model')
        }

    return render_template(
        'vehicle_selection.html',
        dtc_codes=all_dtc_codes,
        user=session.get('user'),
        role=session.get('role'),
        selected_vehicle=selected_vehicle
    )

@app.route('/start-diagnostic', methods=['POST'])
def start_diagnostic():
    """Handles starting diagnostic after vehicle selection."""
    if 'user' not in session:
        return redirect(url_for('login'))
    
    # Mark vehicle as selected
    session['vehicle_selected'] = True
    
    # Optionally store vehicle info
    vehicle_info = request.get_json()
    if vehicle_info:
        session['vehicle_vin'] = vehicle_info.get('vin')
        session['vehicle_model'] = vehicle_info.get('model')
    
    return {'success': True, 'redirect': url_for('index')}

@app.route('/dtc-lookup')
def dtc_lookup():
    """Renders the DTC Lookup Database page."""
    if 'user' not in session:
        return redirect(url_for('login'))
    
    dtc_list = [{
        'code': code,
        'description': dtc_metadata[code]['description'],
        'system': dtc_metadata[code]['system'],
        'severity': dtc_metadata[code]['severity']
    } for code in all_dtc_codes]

    return render_template(
        'dtc_lookup.html',
        dtc_list=dtc_list,
        dtc_codes=all_dtc_codes,
        user=session.get('user'),
        role=session.get('role')
    )

@app.route('/dtc/<code>')
def dtc_detail(code):
    """Renders the details for a specific DTC code."""
    if 'user' not in session:
        return redirect(url_for('login'))
    
    data = dtc_data.get(code, {})
    metadata = dtc_metadata.get(code, {})
    # We pass the list of all codes here too, so the sidebar works
    return render_template(
        'dtc_detail.html',
        code=code,
        data=data,
        metadata=metadata,
        dtc_codes=all_dtc_codes,
        user=session.get('user'),
        role=session.get('role')
    )


@app.route('/api/dtc/<code>')
def dtc_api(code):
    """API endpoint returning structured DTC information for dynamic detail views."""
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = dtc_data.get(code)
    if not data:
        return jsonify({'error': 'DTC not found'}), 404

    sections = []
    for title, section in data.items():
        section_type = section.get('type', 'text')
        content = section.get('content')
        if section_type == 'image' and content:
            sections.append({
                'title': title,
                'type': 'image',
                'content': url_for('static', filename=content)
            })
        elif section_type == 'html':
            sections.append({
                'title': title,
                'type': 'html',
                'content': content or ''
            })
        else:
            sections.append({
                'title': title,
                'type': 'text',
                'content': content or ''
            })

    response_payload = {
        'code': code,
        'metadata': dtc_metadata.get(code, {}),
        'sections': sections
    }

    return jsonify(response_payload)

@app.route('/analysis')
def analysis():
    """Renders the analysis and statistics page."""
    if 'user' not in session:
        return redirect(url_for('login'))
    
    # Calculate statistics for analysis page
    total_dtcs = len(dtc_data)
    
    # Count DTCs by system
    system_counts = {
        'Fuel System': 0,
        'Air Intake': 0,
        'Ignition': 0,
        'Emissions': 0,
        'Chassis/ABS': 0,
        'Body Control': 0,
        'Network': 0,
        'Other': 0
    }
    
    severity_counts = {'High': 0, 'Medium': 0, 'Low': 0}
    
    for code in dtc_data.keys():
        # Categorize by system
        if code.startswith('P00') or code.startswith('P01') or code.startswith('P06'):
            system_counts['Fuel System'] += 1
        elif code.startswith('P02'):
            system_counts['Air Intake'] += 1
        elif code.startswith('P03'):
            system_counts['Ignition'] += 1
        elif code.startswith('P04'):
            system_counts['Emissions'] += 1
        elif code.startswith('C'):
            system_counts['Chassis/ABS'] += 1
        elif code.startswith('B'):
            system_counts['Body Control'] += 1
        elif code.startswith('U'):
            system_counts['Network'] += 1
        else:
            system_counts['Other'] += 1
        
        # Assign severity (simplified logic)
        data_str = str(dtc_data[code])
        if any(word in data_str.upper() for word in ['CRITICAL', 'SEVERE', 'CATALYST']):
            severity_counts['High'] += 1
        elif any(word in data_str.upper() for word in ['SENSOR', 'SIGNAL', 'CIRCUIT']):
            severity_counts['Medium'] += 1
        else:
            severity_counts['Low'] += 1
    
    stats = {
        'total_dtcs': total_dtcs,
        'system_counts': system_counts,
        'severity_counts': severity_counts
    }
    
    return render_template('analysis.html', stats=stats, dtc_codes=all_dtc_codes, user=session.get('user'), role=session.get('role'))

@app.route('/upload-diagnostic-data', methods=['POST'])
def upload_diagnostic_data():
    """Handles CSV file uploads for diagnostic data analysis."""
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Accept either 'csv_files' (used by JS) or 'csv_file' (form fallback)
    files = []
    if 'csv_files' in request.files:
        files = request.files.getlist('csv_files')
    elif 'csv_file' in request.files:
        # Single-file form fallback
        files = request.files.getlist('csv_file')

    if not files:
        return jsonify({'error': 'No file provided'}), 400
    uploaded_files = []
    dataset_sources = []
    dashboard_entries = []
    trip_data = None

    for file in files:
        if file and file.filename and allowed_file(file.filename):
            original_name = file.filename
            unique_id = str(uuid.uuid4())
            filename = f"{unique_id}_{secure_filename(original_name)}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            uploaded_files.append(filename)
            dataset_sources.append({'path': filepath, 'label': original_name or filename})
            dashboard_entries.append({'saved': filename, 'label': original_name or filename})

    if dataset_sources:
        try:
            from analysis import generate_dashboard
            trip_data = generate_dashboard(dataset_sources)
        except Exception as e:
            print(f"Error analyzing trip data: {e}")
    
    if not uploaded_files:
        return jsonify({'error': 'No valid CSV files uploaded'}), 400
    
    response = {
        'success': True,
        'message': f'Successfully uploaded {len(uploaded_files)} file(s)',
        'files': uploaded_files
    }

    if dashboard_entries:
        dashboard_id = str(uuid.uuid4())
        dashboards = session.get('trip_dashboards', {})
        dashboards[dashboard_id] = dashboard_entries
        if len(dashboards) > 5:
            excess = list(dashboards.keys())[:-5]
            for stale_id in excess:
                dashboards.pop(stale_id, None)
        session['trip_dashboards'] = dashboards
        session.modified = True
        response['dashboard_id'] = dashboard_id
        response['dashboard_url'] = url_for('trip_dashboard_batch', dashboard_id=dashboard_id)
    
    if trip_data:
        response['trip_data'] = trip_data
    
    return jsonify(response)

@app.route('/trip-dashboard/<path:trip_id>')
def trip_dashboard(trip_id):
    """Renders the OBD-II trip analysis dashboard."""
    if 'user' not in session:
        return redirect(url_for('login'))

    uploads_root = os.path.abspath(app.config['UPLOAD_FOLDER'])
    csv_path = os.path.abspath(os.path.join(uploads_root, trip_id))

    if not csv_path.startswith(uploads_root + os.sep):
        return "Invalid trip identifier", 400
    
    if not os.path.exists(csv_path):
        return "Trip data not found", 404
    
    try:
        from analysis import generate_dashboard
        trip_data = generate_dashboard(csv_path)
        return render_template('trip_dashboard.html', 
                             trip_data=trip_data, 
                             dtc_codes=all_dtc_codes, 
                             user=session.get('user'), 
                             role=session.get('role'))
    except Exception as e:
        print(f"Error generating dashboard for {csv_path}: {e}")
        return f"Error generating dashboard: {str(e)}", 500


@app.route('/trip-dashboard/batch/<dashboard_id>')
def trip_dashboard_batch(dashboard_id):
    """Renders the trip dashboard for multiple uploaded sessions."""
    if 'user' not in session:
        return redirect(url_for('login'))

    dashboards = session.get('trip_dashboards', {}) or {}
    entries = dashboards.get(dashboard_id)
    if not entries:
        return "Trip data not found", 404

    dataset_sources = []
    for entry in entries:
        saved_name = entry.get('saved')
        if not saved_name:
            continue
        uploads_root = os.path.abspath(app.config['UPLOAD_FOLDER'])
        csv_path = os.path.abspath(os.path.join(uploads_root, saved_name))
        if not csv_path.startswith(uploads_root + os.sep):
            continue
        if not os.path.exists(csv_path):
            continue
        dataset_sources.append({'path': csv_path, 'label': entry.get('label') or saved_name})

    if not dataset_sources:
        return "Trip data not found", 404

    try:
        from analysis import generate_dashboard
        trip_data = generate_dashboard(dataset_sources)
        return render_template(
            'trip_dashboard.html',
            trip_data=trip_data,
            dtc_codes=all_dtc_codes,
            user=session.get('user'),
            role=session.get('role')
        )
    except Exception as e:
        print(f"Error generating combined dashboard: {e}")
        return f"Error generating dashboard: {str(e)}", 500

# Local development server
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)