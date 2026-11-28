import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const WALLPAPER_ROOT = GLib.getenv('MARIA_WALLPAPERS_ROOT') || '/usr/share/maria/wallpapers';

const WALLPAPER_DIRECTORIES = [
    {
        path: `${WALLPAPER_ROOT}/static`,
        type: 'static',
    },
    {
        path: `${WALLPAPER_ROOT}/animated`,
        type: 'animated',
    },
];

const SUPPORTED_FORMATS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.mp4',
    '.webm',
];

export function getWallpapers() {
    const wallpapers = [];

    for (const directory of WALLPAPER_DIRECTORIES) {
        const folder = Gio.File.new_for_path(directory.path);

        if (!folder.query_exists(null))
            continue;

        const enumerator = folder.enumerate_children(
            'standard::name,standard::type',
            Gio.FileQueryInfoFlags.NONE,
            null
        );

        let fileInfo;

        while ((fileInfo = enumerator.next_file(null)) !== null) {
            if (fileInfo.get_file_type() !== Gio.FileType.REGULAR)
                continue;

            const filename = fileInfo.get_name();
            const extension = filename
                .substring(filename.lastIndexOf('.'))
                .toLowerCase();

            if (!SUPPORTED_FORMATS.includes(extension))
                continue;

            wallpapers.push({
                name: filename.substring(0, filename.lastIndexOf('.')),
                filename,
                path: `${directory.path}/${filename}`,
                type: directory.type,
                format: extension,
            });
        }

        enumerator.close(null);
    }

    return wallpapers.sort((a, b) =>
        a.name.localeCompare(b.name, 'es')
    );
}
