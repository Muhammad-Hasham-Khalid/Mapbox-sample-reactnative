import React, { useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import credentials from './credentials';
const { accessToken, clientKey } = credentials;

MapboxGL.setAccessToken(accessToken);

var vectorUrl =
  'https://reportallusa.com/api/rest_services/client=' +
  clientKey +
  '/ParcelsVectorTile/MapBoxVectorTileServer/tile/{z}/{x}/{y}.mvt';

const App = () => {
  const mapRef = useRef();

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapboxGL.MapView
          style={styles.map}
          styleUrl="mapbox://styles/mapbox/light-v10">
          <MapboxGL.VectorSource
            ref={mapRef}
            id="parcels"
            tileUrlTemplates={[vectorUrl]}
            minZoomLevel={14}
            maxZoomLevel={17}>
            <MapboxGL.FillLayer
              id="parcels-fill"
              sourceID="parcels"
              sourceLayerID="parcels"
              style={{
                fillOutlineColor: 'transparent',
                fillColor: 'rgba(144,238,144,1)',
              }}>
              <MapboxGL.LineLayer
                id="parcels-line"
                sourceID="parcels"
                sourceLayerID="parcels"
                style={{
                  lineWidth: 3,
                  lineColor: '#ffa748',
                }}
              />
            </MapboxGL.FillLayer>
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  container: {
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
    backgroundColor: 'tomato',
  },
  map: {
    flex: 1,
  },
});

export default App;
