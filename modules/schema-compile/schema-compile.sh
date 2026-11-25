#!/usr/bin/env bash

set -euo pipefail

echo "Registrando esquemas de configuración de GNOME..."
glib-compile-schemas /usr/share/glib-2.0/schemas
echo "Esquemas registrados correctamente."

