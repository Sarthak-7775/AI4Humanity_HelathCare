$dirs = @(
  "frontend\src\components",
  "frontend\src\pages",
  "frontend\src\context",
  "frontend\src\assets",
  "backend\app\api",
  "backend\app\core",
  "backend\app\models",
  "backend\app\schemas",
  "backend\app\services",
  "dataset"
)

foreach ($dir in $dirs) {
  if (!(Test-Path $dir)) { 
      New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
}

$files = @(
  "backend\app\api\routes_triage.py",
  "backend\app\api\routes_routing.py",
  "backend\app\api\routes_users.py",
  "backend\app\core\config.py",
  "backend\app\core\database.py",
  "backend\app\services\rag_engine.py",
  "backend\app\services\routing_engine.py",
  "backend\app\main.py",
  "backend\requirements.txt",
  "dataset\synthetic_hospitals.xlsx"
)

foreach ($file in $files) {
  if (!(Test-Path $file)) { 
      New-Item -ItemType File -Force -Path $file | Out-Null
  }
}

if (!(Test-Path "backend\.env")) { 
    New-Item -ItemType File -Force -Path "backend\.env" | Out-Null
}

Write-Host "Repository structure created successfully."
