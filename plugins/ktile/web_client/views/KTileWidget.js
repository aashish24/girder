import View from 'girder/views/View';
import { AccessType } from 'girder/constants';

import KTileWidgetTemplate from '../templates/KTileWidget.pug';
import '../stylesheets/KTileWidget.styl';

import geo from 'geojs';

var KTileWidget = View.extend({
    initialize: function (settings) {
        this.item = settings.item;
        this.accessLevel = settings.accessLevel;
        this.item.on('change', function () {
            this.render();
        }, this);
        this.render();
    },

    render: function () {
        var meta = this.item.get('meta');
        console.log('ktilewidget');
        console.log(meta);
        if (this.accessLevel >= AccessType.READ && meta && meta.geojson) {
            $('#g-app-body-container')
                .append(KTileWidgetTemplate());
            $.ajax({
                url: '/api/v1/item/' + this.item.get('_id') + '/download',
                type: 'GET',
                dataType: 'json',
                success: function (geojson) {
                    // vg.parse.spec(spec, function (chart) {
                    //     chart({
                    //         el: '.g-item-vega-vis',
                    //         renderer: 'svg'
                    //     }).update();
                    // });
                    'use strict';

                    // Create a map object
                    var map = geo.map({
                        node: '#g-map',
                        center: {
                          x: -125,
                          y: 36.5
                        },
                        zoom: 4
                        });

                    // Add the osm layer with a custom tile url
                    map.createLayer(
                    'osm',
                    {
                      url: 'http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png',
                      attribution: ['Map tiles by <a href="http://stamen.com">Stamen Design</a>,',
                        'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.',
                        'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under',
                        '<a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
                      ].join(' ')
                    }
                    );

                    // Create a layer to put the features in.  We could need point, line, and
                    // polygon features, so ask for a layer that supports all of them.
                    var layer = map.createLayer('feature', {features: ['point', 'line', 'polygon']});
                    map.draw();

                    // Initialize the json reader.
                    var reader = geo.createFileReader('jsonReader', {'layer': layer});

                    // At this point we could just attach the reader to the map like
                    // this:
                    //
                    //   map.fileReader(reader);
                    //
                    // This would allow the user to drop a geojson file onto the
                    // map to render it.  For this demo, we are creating an
                    // editable text box that will call the reader.
                    reader.read(
                      geojson,
                      function (/* features */) {

                        // This callback is called after the features are generated.  The
                        // feature objects array is given as an argument to this callback
                        // for inspection or modification.  In this case, we just want
                        // to redraw the map with the new features.
                        map.draw();
                      }
                    );
                  }
            });
        } else {
            $('.g-item-vega')
                .remove();
        }
    }
});

export default KTileWidget;
