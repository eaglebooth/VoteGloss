from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
commands = [
    [sys.executable, "-m", "pytest", "-q", "--tb=short", "-p", "no:cacheprovider"],
    [sys.executable, "-X", "utf8", "-m", "genvm_linter.cli", "check", "contracts/vote_gloss.py"],
    [sys.executable, "-X", "utf8", "-m", "genvm_linter.cli", "schema", "contracts/vote_gloss.py", "-o", "docs/schema.json"],
]
for command in commands:
    print("$", " ".join(command), flush=True)
    result = subprocess.run(command, cwd=ROOT)
    if result.returncode:
        raise SystemExit(result.returncode)
