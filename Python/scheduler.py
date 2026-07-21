"""
scheduler.py — Tự động chạy pipeline lúc 6PM mỗi ngày thứ 2-6.

Cách dùng:
  python scheduler.py            # Chạy nền, pipeline tự kích hoạt lúc 6PM
  python scheduler.py --run-now  # Chạy pipeline ngay lập tức (dùng để test)
"""
import schedule
import time
import subprocess
import logging
import argparse
from datetime import datetime
from pathlib import Path

# ── Logging setup ─────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_DIR / "scheduler.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

PYTHON_BIN = BASE_DIR / ".venv" / "Scripts" / "python.exe"
PIPELINE_SCRIPT = BASE_DIR / "pipeline.py"


def run_pipeline():
    """Kích hoạt pipeline.py trong subprocess."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"[{now}] Triggering stock data pipeline...")

    try:
        result = subprocess.run(
            [str(PYTHON_BIN), "-X", "utf8", str(PIPELINE_SCRIPT), "--skip-n8n"],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if result.returncode == 0:
            logger.info("Pipeline completed successfully.")
        else:
            logger.error(f"Pipeline failed (exit code {result.returncode}).")
            if result.stderr:
                logger.error(f"STDERR:\n{result.stderr[-2000:]}")  # last 2000 chars
    except Exception as e:
        logger.error(f"Failed to launch pipeline: {e}")


def main():
    parser = argparse.ArgumentParser(description="Stock Pipeline Scheduler — 6PM Mon-Fri")
    parser.add_argument(
        "--run-now",
        action="store_true",
        help="Chạy pipeline ngay lập tức thay vì chờ đến 6PM.",
    )
    args = parser.parse_args()

    if args.run_now:
        logger.info("--run-now flag detected. Running pipeline immediately...")
        run_pipeline()
        return

    # Lên lịch: 18:00 mỗi ngày thứ 2-6
    schedule.every().monday.at("18:00").do(run_pipeline)
    schedule.every().tuesday.at("18:00").do(run_pipeline)
    schedule.every().wednesday.at("18:00").do(run_pipeline)
    schedule.every().thursday.at("18:00").do(run_pipeline)
    schedule.every().friday.at("18:00").do(run_pipeline)

    logger.info("=" * 50)
    logger.info("Stock Pipeline Scheduler Started")
    logger.info("Schedule: Mon-Fri at 18:00 (6PM)")
    logger.info("Để dừng: nhấn Ctrl+C")
    logger.info("=" * 50)

    next_run = schedule.next_run()
    logger.info(f"Next scheduled run: {next_run}")

    # Vòng lặp chờ
    while True:
        schedule.run_pending()
        time.sleep(30)  # Kiểm tra mỗi 30 giây


if __name__ == "__main__":
    main()
