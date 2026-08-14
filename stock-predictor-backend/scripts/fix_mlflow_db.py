import sqlite3
import os

db_path = "mlflow.db"
if not os.path.exists(db_path):
    print("mlflow.db not found")
    exit(0)

# Proper 3-slash format for Windows file URI: file:///D:/...
current_dir = os.path.abspath(".").replace("\\", "/")
if not current_dir.startswith("/"):
    current_dir = "/" + current_dir

base_uri = f"file://{current_dir}"
print(f"Base file URI: {base_uri}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# 1. Update experiments table
c.execute("SELECT experiment_id, artifact_location FROM experiments")
for exp_id, loc in c.fetchall():
    new_loc = f"{base_uri}/mlruns/{exp_id}"
    c.execute("UPDATE experiments SET artifact_location = ? WHERE experiment_id = ?", (new_loc, exp_id))
    print(f"Updated experiment {exp_id} -> {new_loc}")

# 2. Update runs table
c.execute("SELECT run_uuid, experiment_id FROM runs")
for run_id, exp_id in c.fetchall():
    new_uri = f"{base_uri}/mlruns/{exp_id}/{run_id}/artifacts"
    c.execute("UPDATE runs SET artifact_uri = ? WHERE run_uuid = ?", (new_uri, run_id))

conn.commit()
conn.close()
print("Successfully formatted all artifact URIs to file:/// standard!")
