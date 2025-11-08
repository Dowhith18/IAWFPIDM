# IAWFPIDM

## Intelligent Automotive Wiring Fault Prediction & Interactive Diagnostic Manual

A comprehensive Flask-based web application for automotive diagnostics, featuring an interactive diagnostic trouble code (DTC) lookup system and intelligent fault prediction capabilities.

## 🚗 Features

- **Interactive DTC Lookup Database**: Search and browse thousands of diagnostic trouble codes
- **Intelligent Fault Prediction**: Real-time analysis of engine sensors and wiring faults
- **Engine-Specific Diagnostics**: Detailed fault predictions for critical components (Fuel Pump Relay, Fuel Injectors)
- **Detailed Diagnostic Information**: Step-by-step troubleshooting guides for each DTC
- **Vehicle Dashboard**: Real-time vehicle diagnostics with 6 key metrics (Odometer, Battery Voltage, RPM, Speed, Engine State, Electrical Health)
- **OBD-II Trip Analysis**: Comprehensive trip data analysis with interactive charts and statistics
- **Vehicle Selection Interface**: Record vehicle information before starting diagnostics
- **User Authentication**: Role-based access control (Admin, Technician, Viewer)
- **Responsive Design**: Modern, user-friendly interface with dark/light theme support
- **Real-time Search**: Quick filtering and navigation through DTC codes
- **Comprehensive Coverage**: Supports multiple automotive systems:
  - Engine Management (P-codes)
  - Chassis/ABS (C-codes)
  - Body Control (B-codes)
  - Network/Communication (U-codes)

## 📋 Prerequisites

- Python 3.7 or higher
- pip (Python package installer)
- Virtual environment (recommended)

**Windows (recommended)**: Installing binary scientific packages (numpy, pandas, matplotlib) with pip on Windows can fail when compiled wheels are not available for your Python version. For a smooth setup on Windows prefer using Miniconda/Anaconda and the provided conda environment file below.

### Windows (Conda) — recommended

If you are on Windows, creating a Conda environment with prebuilt binary packages avoids pip build failures for packages like numpy and pandas. A ready-to-use Conda environment file is included as `environment-windows.yml` in the project root. Example steps:

```powershell
conda env create -f environment-windows.yml
conda activate iawfpidm
# (optional) install any remaining Python packages from requirements
pip install -r requirements.txt
python app.py
```

This sets up numpy, pandas, matplotlib and other binary dependencies using Anaconda/Conda packages that work on Windows.

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Dowhith18/Intelligent-Automotive-Wiring-Fault-Prediction-Interactive-Diagnostic-Manual.git
cd Intelligent-Automotive-Wiring-Fault-Prediction-Interactive-Diagnostic-Manual
```

### 2. Create and activate a virtual environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

If `pip install` fails on Windows due to building binary packages (errors during numpy/pandas install), use the provided `environment-windows.yml` with conda instead:

```powershell
conda env create -f environment-windows.yml
conda activate iawfpidm
pip install -r requirements.txt
```

## 🚀 Running the Application

### Local Development

1. Activate your virtual environment (if not already activated)
2. Run the Flask application:

```bash
python app.py
```

3. Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

### Default Login Credentials

The application comes with three pre-configured users:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| technician | tech123 | Technician |
| viewer | view123 | Viewer |

**⚠️ Important**: Change these default credentials before deploying to production!

## 📁 Project Structure

```
├── app.py                              # Main Flask application
├── scraper.py                          # Web scraping utility for DTC data
├── requirements.txt                    # Python dependencies
├── dtc_data.json                       # DTC database (6000+ codes)
├── .flaskenv                           # Flask environment configuration
├── vercel.json                         # Vercel deployment configuration
├── static/                             # Static assets
│   ├── css/
│   │   ├── diagnostic_app.css         # Application styles
│   │   └── style.css                  # Main application styles
│   ├── js/
│   │   └── diagnostic_app.js          # Frontend logic & fault predictions
│   ├── logo.png                       # Application logo (50x50px recommended)
│   └── EMS_ECU/                       # EMS/ECU documentation assets
├── templates/                          # HTML templates
│   ├── base.html                      # Base template with navigation
│   ├── index.html                     # Dashboard/home page with fault predictions
│   ├── login.html                     # Login page
│   ├── vehicle_selection.html         # Vehicle info capture
│   ├── analysis.html                  # Analysis & Statistics page
│   ├── trip_dashboard.html            # OBD-II Trip Analysis with charts
│   ├── dtc_lookup.html                # DTC database table
│   └── dtc_detail.html                # Individual DTC details
├── EMS_ECU/                            # EMS/ECU documentation files
└── combined_ems_ecu_documentation.html # Combined documentation
```

## 🔧 Configuration

### Flask Configuration

Edit `.flaskenv` to customize Flask settings:

```
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
```

### Secret Key

Update the secret key in `app.py` for production:

```python
app.secret_key = 'your-secret-key-change-this-in-production'
```

Generate a secure secret key:

```python
import secrets
print(secrets.token_hex(16))
```

## 📊 Features in Detail

### DTC Lookup Database

- **6000+ Diagnostic Codes**: Comprehensive coverage of automotive DTCs
- **Advanced Filtering**: Search by code, description, system, or severity
- **System Categories**: Organized by automotive system (Fuel, Ignition, Emissions, etc.)
- **Severity Ratings**: High, Medium, Low priority classification

### Intelligent Fault Prediction

- **Engine-Specific Analysis**: Real-time monitoring of critical engine components
- **Wiring Fault Detection**: Identifies open circuits, short circuits, and ground faults
- **Fault Impact Assessment**: Shows immediate and potential impacts on vehicle operation
- **Actionable Recommendations**: Provides specific repair guidance for each fault
- **Current Fault Examples**:
  - **P062700**: Fuel Pump Relay Control Circuit (Open Circuit) - High Severity
  - **P026100**: Fuel Injector 1 Control Circuit (Short to Ground) - High Severity

### Vehicle Dashboard Metrics

- **Odometer Reading**: Track vehicle mileage
- **Battery Voltage**: Monitor electrical system health (13.8V nominal)
- **Engine RPM**: Real-time engine speed monitoring
- **Vehicle Speed**: Current speed in km/h
- **Engine State**: Running status indicator
- **Electrical Health**: Overall electrical system percentage (0-100%)

### OBD-II Trip Analysis

- **Interactive Charts**: Four fullscreen-capable visualization charts
- **Trip Statistics**: Distance, duration, fuel efficiency, average speed
- **Data Export**: CSV upload for historical trip data analysis
- **Comprehensive Insights**: Detailed breakdown of driving behavior and vehicle performance

### Diagnostic Workflow

1. **Login**: Authenticate with role-based credentials
2. **Vehicle Selection**: Enter VIN and vehicle details (Make, Model, Year)
3. **Dashboard**: View real-time metrics and fault predictions
4. **Analysis & Statistics**: Upload trip data for comprehensive analysis
5. **OBD-II Trip Dashboard**: Interactive charts and driving behavior insights
6. **DTC Lookup**: Browse or search the complete DTC database
7. **Detailed Diagnostics**: View step-by-step troubleshooting guides with images

## 🌐 Deployment

### Vercel Deployment

This application is configured for Vercel deployment:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Production Considerations

- **Security**: Update secret keys and user credentials
- **Database**: Replace in-memory user dict with proper database
- **HTTPS**: Ensure SSL/TLS encryption
- **Environment Variables**: Use environment variables for sensitive data
- **Session Management**: Configure secure session cookies

## 🛡️ Security Notes

- Change default user credentials before production deployment
- Use environment variables for sensitive configuration
- Implement proper password hashing (currently using plain text)
- Add CSRF protection for forms
- Enable HTTPS in production
- Consider implementing session timeout

## 📦 Dependencies

- **Flask 3.1.2**: Web framework
- **pandas 2.2.3**: Data analysis and manipulation
- **matplotlib 3.9.3**: Plotting and visualization
- **numpy 2.0.2**: Numerical computing
- **beautifulsoup4 4.14.2**: HTML parsing for scraping
- **Jinja2 3.1.6**: Template engine
- **Werkzeug 3.1.3**: WSGI utility library

See `requirements.txt` for complete dependency list.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Dowhith18**
- GitHub: [@Dowhith18](https://github.com/Dowhith18)

## 🙏 Acknowledgments

- DTC data sourced from automotive diagnostic specifications
- Built with Flask and modern web technologies

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note**: This is a development/educational project. For production automotive diagnostics, always refer to official manufacturer documentation and specifications.
