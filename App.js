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

  const handleTilePress = async tileData => {
    const robustId = tileData.features.length
      ? tileData.features[0].properties.robust_id
      : null;
    if (robustId) {
      try {
        const response = await (
          await fetch(
            `https://reportallusa.com/api/rest_services/client=${clientKey}/Parcels/MapServer/0/query?where=robust_id=%27${robustId}%27`,
          )
        ).json();
        response.features.forEach(feature => {
          console.log({
            attributes: feature.attributes,
          });
        });
      } catch (error) {
        console.log({ error });
      }
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapboxGL.MapView
          style={styles.map}
          styleUrl="mapbox://styles/mapbox/light-v10">
          <MapboxGL.VectorSource
            ref={mapRef}
            id="parcels"
            onPress={handleTilePress}
            tileUrlTemplates={[vectorUrl]}
            minZoomLevel={14}
            maxZoomLevel={17}>
            <MapboxGL.FillLayer
              id="parcels-fill"
              sourceID="parcels"
              sourceLayerID="parcels"
              style={{
                fillOutlineColor: 'transparent',
                fillColor: '#55ff3388',
              }}
            />
            <MapboxGL.LineLayer
              id="parcels-line"
              sourceID="parcels"
              sourceLayerID="parcels"
              style={{
                lineWidth: 3,
                lineColor: '#ff9922',
              }}
            />
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
