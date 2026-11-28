#!/usr/bin/env bash
set -euo pipefail

echo "=== MARÍA LINUX: Eliminando integración de Waydroid ==="

python3 - <<'PY'
from pathlib import Path
import shutil

def replace_once(path, old, new):
    file = Path(path)
    if not file.is_file():
        raise RuntimeError(f"No se encontró el archivo esperado: {path}")

    content = file.read_text()
    count = content.count(old)

    if count != 1:
        raise RuntimeError(
            f"Se esperaba encontrar exactamente una coincidencia en {path}; "
            f"se encontraron {count}. No se modificó."
        )

    file.write_text(content.replace(old, new, 1))
    print(f"[OK] Configuración actualizada: {path}")


def remove_section(path, heading):
    file = Path(path)
    if not file.is_file():
        raise RuntimeError(f"No se encontró el archivo esperado: {path}")

    lines = file.read_text().splitlines(keepends=True)
    matches = [i for i, line in enumerate(lines) if line.rstrip("\n") == heading]

    if len(matches) != 1:
        raise RuntimeError(
            f"Se esperaba una sección {heading!r} en {path}; "
            f"se encontraron {len(matches)}."
        )

    start = matches[0]
    end = start + 1

    while end < len(lines):
        current = lines[end].strip()
        if current.startswith("[") and current.endswith("]"):
            break
        end += 1

    del lines[start:end]
    file.write_text("".join(lines))
    print(f"[OK] Sección eliminada: {heading}")


# 1. Eliminar Waydroid de las carpetas de aplicaciones de GNOME.
replace_once(
    "/usr/share/glib-2.0/schemas/zz0-02-bazzite-desktop-silverblue-folders.gschema.override",
    ", 'Waydroid'",
    ""
)

remove_section(
    "/etc/dconf/db/distro.d/01-bazzite-desktop-silverblue-folders",
    "[org/gnome/desktop/app-folders/folders/Waydroid]"
)

# 2. Eliminar la entrada de Waydroid del asistente Yafti.
replace_once(
    "/usr/share/yafti/yafti.yml",
    '''      - id: "waydroid"
        title: "Waydroid"
        description: "Android system in a container, for app compatibility on Linux."
        default: false
        options:
          - id: "init"
            label: "Initialize"
            script: "ujust configure-waydroid init"
          - id: "configure"
            label: "Configure"
            script: "ujust configure-waydroid configure"
          - id: "gpu"
            label: "Select GPU"
            script: "ujust configure-waydroid gpu"
          - id: "reset"
            label: "Reset"
            script: "ujust configure-waydroid reset"
          - id: "helper"
            label: "Install Helper"
            script: "ujust configure-waydroid helper"
''',
    ""
)

# 3. Eliminar el comando de configuración de Waydroid de ujust.
replace_once(
    "/usr/share/ublue-os/justfile",
    'import "/usr/share/ublue-os/just/82-bazzite-waydroid.just"\n',
    ""
)

# 4. Retirar exclusivamente el arreglo de Waydroid del asistente de hardware.
replace_once(
    "/usr/libexec/bazzite-hardware-setup",
    '''# WAYDROID FIX
if [[ -f "/var/lib/waydroid/lxc/waydroid/config" ]]; then
  echo "Removing unneeded apparmor entry from Waydroid LXC"
  sed -i '/lxc\\.apparmor\\.profile\\s*=\\s*unconfined/d' "/var/lib/waydroid/lxc/waydroid/config"
fi

''',
    ""
)

print("[OK] Configuraciones de GNOME y Bazzite actualizadas.")
PY

# 5. Retirar archivos auxiliares instalados por Bazzite.
FILES=(
    /etc/default/waydroid-launcher
    /usr/bin/waydroid-choose-gpu
    /usr/bin/waydroid-launcher
    /usr/libexec/waydroid-container-start
    /usr/libexec/waydroid-container-stop
    /usr/libexec/waydroid-container-restart
    /usr/libexec/waydroid-fix-controllers
    /usr/share/ublue-os/just/82-bazzite-waydroid.just
    /usr/share/polkit-1/actions/org.bazzite.waydroid.policy
    /usr/share/polkit-1/rules.d/30-waydroid.rules
    /usr/share/applications/waydroid-container-restart.desktop
    /usr/share/applications/waydroid.app.install.desktop
    /usr/share/applications/waydroid.market.desktop
    /usr/share/desktop-directories/waydroid.directory
)

for file in "${FILES[@]}"; do
    rm -f "$file"
done

# Recursos gráficos exclusivos de Waydroid.
rm -rf /usr/share/applications/Waydroid

echo "=== Limpieza de integración de Waydroid completada ==="
