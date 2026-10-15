"""Remove only obsolete generated HTML shells after the new payload is uploaded.

Uses the existing SFTP credentials/destination. No SSH shell or recursive deletion.
Run from the repository root; sshpass and OpenSSH sftp must be available.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile


def obsolete_shells(listing, expected):
    """OpenSSH ls -1 prefixes entries with the requested directory."""
    found = set()
    for line in listing.splitlines():
        line = line.strip()
        if line.startswith("sftp>") or not line:
            continue
        if line in ("seo-pages/.", "seo-pages/.."):
            continue
        if not line.startswith("seo-pages/"):
            raise ValueError("Unexpected SFTP directory listing; refusing cleanup")
        name = line[len("seo-pages/"):]
        if re.fullmatch(r"[a-z0-9][a-z0-9-]*\.html", name):
            found.add(name)
        elif name != "manifest.json":
            raise ValueError("Unexpected file in generated SEO directory; refusing cleanup")
    if not expected.issubset(found):
        raise ValueError("New SEO shells missing remotely; refusing cleanup/routing activation")
    return sorted(found - expected)


def main():
    manifest = json.loads(Path("dist/seo-pages/manifest.json").read_text())
    expected = {Path(route["file"]).name for route in manifest["routes"]}
    expected.add(Path(manifest["error"]["file"]).name)
    user = os.environ["SFTP_USERNAME"]
    server = "access-5017155687.webspace-host.com"
    # Match the existing action's password authentication and host-key behaviour.
    env = dict(os.environ, SSHPASS=os.environ["SFTP_PASSWORD"])
    with tempfile.TemporaryDirectory(prefix="seo-sftp-") as temporary:
        batch = Path(temporary) / "batch"

        def sftp(commands):
            batch.write_text("\n".join(commands) + "\n")
            result = subprocess.run([
                "sshpass", "-e", "sftp", "-oBatchMode=no",
                "-oStrictHostKeyChecking=no", "-P", "22", "-b", str(batch),
                f"{user}@{server}",
            ], env=env, text=True, capture_output=True, check=False)
            if result.returncode:
                # Do not print credentials or the subprocess environment.
                raise RuntimeError(f"SFTP failed ({result.returncode}): {result.stderr.strip()}")
            return result.stdout

        stale = obsolete_shells(sftp(["ls -1 seo-pages/"]), expected)
        if stale:
            sftp([f'rm "seo-pages/{name}"' for name in stale])
        if obsolete_shells(sftp(["ls -1 seo-pages/"]), expected):
            raise RuntimeError("Obsolete SEO shells still present; refusing routing activation")
        print(f"Remote SEO payload verified; removed {len(stale)} obsolete generated HTML shells.")


if __name__ == "__main__":
    main()
