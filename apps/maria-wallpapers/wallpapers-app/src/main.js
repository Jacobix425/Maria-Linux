import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

import { getWallpapers } from './catalog.js';
import { createGallery } from './gallery.js';

const DATA_DIR = GLib.getenv('MARIA_WALLPAPERS_APP_DATA')
    || '/usr/share/maria/wallpapers-app/data';

const app = new Adw.Application({
    application_id: 'com.maria.Wallpapers',
    flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

app.connect('activate', () => {
    Adw.StyleManager.get_default().color_scheme =
        Adw.ColorScheme.FORCE_LIGHT;

    const cssProvider = new Gtk.CssProvider();
    cssProvider.load_from_path(`${DATA_DIR}/style.css`);

    Gtk.StyleContext.add_provider_for_display(
        Gdk.Display.get_default(),
        cssProvider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );

    const window = new Adw.ApplicationWindow({
        application: app,
        title: 'MARÍA Wallpapers',
        default_width: 1050,
        default_height: 780,
    });

    window.add_css_class('maria-window');

    const header = new Adw.HeaderBar();
    header.add_css_class('maria-header');

    header.set_title_widget(new Adw.WindowTitle({
        title: 'MARÍA Wallpapers',
    }));

    const toolbar = new Adw.ToolbarView();
    toolbar.add_top_bar(header);

    const content = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 12,
        margin_top: 12,
        margin_bottom: 16,
        margin_start: 22,
        margin_end: 22,
        vexpand: true,
    });

    // Logotipo de MARÍA Wallpapers

    const logo = Gtk.Picture.new_for_filename(
        `${DATA_DIR}/maria-wallpapers-logo.png`
    );

    logo.set_can_shrink(true);
    logo.set_content_fit(Gtk.ContentFit.CONTAIN);
    logo.set_size_request(300, 89);
    logo.set_halign(Gtk.Align.CENTER);

    content.append(logo);

    // Encabezado de la colección

    const collectionHeader = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
        margin_top: 4,
    });

    const heading = new Gtk.Label({
        label: 'Fondos disponibles',
        halign: Gtk.Align.START,
        hexpand: true,
    });

    heading.add_css_class('maria-heading');
    collectionHeader.append(heading);

    const wallpapers = getWallpapers();

    const counter = new Gtk.Label({
        label: `${wallpapers.length} fondos`,
        halign: Gtk.Align.END,
    });

    counter.add_css_class('wallpaper-type');
    collectionHeader.append(counter);

    content.append(collectionHeader);

    // Galería

    const selectionLabel = new Gtk.Label({
        label: 'Selecciona un fondo',
        halign: Gtk.Align.START,
        ellipsize: 3,
        hexpand: true,
    });

    selectionLabel.add_css_class('wallpaper-name');

    const gallery = createGallery(wallpapers, (wallpaper) => {
        selectionLabel.set_label(
            `Seleccionado: ${wallpaper.name}`
        );
    });

    gallery.set_vexpand(true);
    content.append(gallery);

    // Información del fondo seleccionado

    const footer = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 8,
        margin_top: 4,
    });

    const separator = new Gtk.Separator({
        orientation: Gtk.Orientation.HORIZONTAL,
        margin_bottom: 4,
    });

    content.append(separator);
    footer.append(selectionLabel);
    content.append(footer);

    toolbar.set_content(content);
    window.set_content(toolbar);
    window.present();
});

app.run([]);
