import sqlite3
import os

db_path = "mlflow.db"
if not os.path.exists(db_path):
    print("mlflow.db not found")
    exit(0)

current_dir = os.path.abspath(".").replace("\\", "/")
mlruns_dir = f"file:{current_dir}/mlruns"
print(f"Current mlruns base: {mlruns_dir}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Update experiments
c.execute("SELECT experiment_id, artifact_location FROM experiments")
for exp_id, loc in c.fetchall():
    if loc and ("D:" in loc or "d:" in loc):
        # Extract relative tail after mlruns
        idx = loc.find("/mlruns")
        tail = loc[idx:] if idx != -1 else f"/mlruns/{exp_id}"
        new_loc = f"file:{current_dir}{tail}"
        c.execute("UPDATE experiments SET artifact_location = ? WHERE experiment_id = ?", (new_loc, exp_id))
        print(f"Updated experiment {exp_id}: {loc} -> {new_loc}")

# Update runs
c.execute("SELECT run_uuid, artifact_uri FROM runs")
for run_id, uri in c.fetchall():
    if uri and ("D:" in uri or "d:" in uri):
        idx = uri.find("/mlruns")
        tail = uri[idx:] if idx != -1 else f"/mlruns/1/{run_id}/artifacts"
        new_uri = f"file:{current_dir}{tail}"
        c.execute("UPDATE runs SET artifact_uri = ? WHERE run_uuid = ?", (new_uri, run_id))

# Update model_versions
try:
    c.execute("SELECT name, version, source FROM model_versions")
    for name, ver, src in c.fetchall():
        if src and ("D:" in src or "d:" in src):
            idx = src.find("/mlruns")
            tail = src[idx:] if idx != -1 else f"/mlruns/models/{name}/{ver}"
            new_src = f"file:{current_dir}{tail}"
            c.execute("UPDATE model_versions SET source = ? WHERE name = ? AND version = ?", (new_src, name, ver))
except Exception as e:
    pass

conn.commit()
conn.close()
print("Fix completed successfully!")
