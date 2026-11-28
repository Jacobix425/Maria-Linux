import Gtk from 'gi://Gtk?version=4.0';

export function createGallery(wallpapers, onSelect) {
    const flowBox = new Gtk.FlowBox({
        selection_mode: Gtk.SelectionMode.NONE,
        min_children_per_line: 2,
        max_children_per_line: 6,
        row_spacing: 12,
        column_spacing: 12,
        homogeneous: true,
        valign: Gtk.Align.START,
    });

    flowBox.add_css_class('wallpaper-grid');

    const cards = [];

    for (const wallpaper of wallpapers) {
        const card = new Gtk.Button();
        card.add_css_class('wallpaper-card');
        card.set_hexpand(true);
        card.set_valign(Gtk.Align.START);

        const content = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 4,
        });

        if (wallpaper.type === 'static') {
            const picture = Gtk.Picture.new_for_filename(
                wallpaper.path
            );

            picture.set_can_shrink(true);
            picture.set_content_fit(Gtk.ContentFit.COVER);
            picture.set_size_request(160, 90);
            picture.set_overflow(Gtk.Overflow.HIDDEN);
            picture.add_css_class('wallpaper-thumbnail');

            content.append(picture);
        } else {
            const preview = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                height_request: 90,
                halign: Gtk.Align.FILL,
                valign: Gtk.Align.CENTER,
            });

            preview.add_css_class('wallpaper-video-placeholder');

            const playIcon = new Gtk.Label({
                label: '▶',
                halign: Gtk.Align.CENTER,
            });

            preview.append(playIcon);
            content.append(preview);
        }

        const name = new Gtk.Label({
            label: wallpaper.name,
            halign: Gtk.Align.CENTER,
            wrap: true,
            max_width_chars: 20,
            lines: 2,
        });

        name.add_css_class('wallpaper-name');
        content.append(name);

        const type = new Gtk.Label({
            label: wallpaper.type === 'animated'
                ? '▶ Animado'
                : 'Imagen',
            halign: Gtk.Align.CENTER,
        });

        type.add_css_class('wallpaper-type');
        content.append(type);

        card.set_child(content);

        card.connect('clicked', () => {
            for (const item of cards) {
                item.remove_css_class('selected');
            }

            card.add_css_class('selected');
            onSelect(wallpaper);
        });

        cards.push(card);
        flowBox.append(card);
    }

    const scrolledWindow = new Gtk.ScrolledWindow({
        hscrollbar_policy: Gtk.PolicyType.NEVER,
        vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
        vexpand: true,
        propagate_natural_height: false,
    });

    scrolledWindow.set_child(flowBox);

    return scrolledWindow;
}
