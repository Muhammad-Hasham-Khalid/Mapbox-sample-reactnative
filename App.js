import React, { useRef, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import credentials from './credentials';
import { RadioButton } from 'react-native-paper';
import { polygonToCoords } from './utils';
const { accessToken, clientKey } = credentials;

MapboxGL.setAccessToken(accessToken);

var vectorUrl =
  'https://reportallusa.com/api/rest_services/client=' +
  clientKey +
  '/ParcelsVectorTile/MapBoxVectorTileServer/tile/{z}/{x}/{y}.mvt';

const SearchType = {
  ownerName: 'owner name',
  parcelId: 'parcel id',
  address: 'address',
};

const App = () => {
  const [region, setRegion] = useState('Cuyahoga County, Ohio');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(SearchType.ownerName);
  const [results, setResults] = useState([]);

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
        console.log(response);
      } catch (error) {
        console.log({ error });
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm || !region) {
      return;
    }

    let url = '';
    const _searchTerm = searchTerm.trim();
    if (searchType === SearchType.ownerName) {
      url = `https://reportallusa.com/api/parcels.php?client=${clientKey}&v=4&region=${region}&owner=${_searchTerm}`;
    }
    if (searchType === SearchType.parcelId) {
      url = `https://reportallusa.com/api/parcels.php?client=${clientKey}&v=4&region=${region}&parcel_id=${_searchTerm}`;
    }
    if (searchType === SearchType.address) {
      url = `https://reportallusa.com/api/parcels.php?client=${clientKey}&v=4&region=${region}&address=${_searchTerm}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      const _results = data.results.map(result => ({
        ...result,
        geom_as_wkt: polygonToCoords(result.geom_as_wkt),
      }));
      setResults(_results);
    } catch (error) {
      console.log({ error });
    }
  };

  const InputContainer = (
    <View style={styles.inputContainer}>
      <View style={styles.searchGroup}>
        <TextInput
          style={styles.input}
          placeholder="Enter Region"
          value={region}
          onChangeText={setRegion}
        />
        <TextInput
          style={styles.input}
          placeholder={`Enter ${searchType}`}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <Text>Search by:</Text>
      <View style={styles.radioGroup}>
        <View style={styles.radioItem}>
          <RadioButton
            value={SearchType.ownerName}
            status={
              searchType === SearchType.ownerName ? 'checked' : 'unchecked'
            }
            onPress={() => setSearchType(SearchType.ownerName)}
          />
          <Text>Owner Name</Text>
        </View>
        <View style={styles.radioItem}>
          <RadioButton
            value={SearchType.parcelId}
            status={
              searchType === SearchType.parcelId ? 'checked' : 'unchecked'
            }
            onPress={() => setSearchType(SearchType.parcelId)}
          />
          <Text>Parcel Id</Text>
        </View>
        <View style={styles.radioItem}>
          <RadioButton
            value={SearchType.address}
            status={searchType === SearchType.address ? 'checked' : 'unchecked'}
            onPress={() => setSearchType(SearchType.address)}
          />
          <Text>Address</Text>
        </View>
      </View>
    </View>
  );

  const MapBoxView = (
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
        {results.map((result, idx) => (
          <MapboxGL.ShapeSource
            cluster={true}
            clusterRadius={512}
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: result.geom_as_wkt,
              },
              properties: {
                county_name: result.county_name,
                muni_name: result.muni_name,
                state_abbr: result.state_abbr,
                addr_number: result.addr_number,
                addr_street_name: result.addr_street_name,
                physcity: result.physcity,
                physzip: result.physzip,
                census_zip: result.census_zip,
                owner: result.owner,
                mail_name: result.mail_name,
                mail_address1: result.mail_address1,
                mail_address3: result.mail_address3,
                trans_date: result.trans_date,
                sale_price: result.sale_price,
                bldg_sqft: result.bldg_sqft,
                ngh_code: result.ngh_code,
                land_use_code: result.land_use_code,
                land_use_class: result.land_use_class,
                muni_id: result.muni_id,
                school_dist_id: result.school_dist_id,
                acreage_deeded: result.acreage_deeded,
                acreage_calc: result.acreage_calc,
                latitude: result.latitude,
                longitude: result.longitude,
                usps_residential: result.usps_residential,
              },
            }}
            key={idx}
          />
        ))}
      </MapboxGL.VectorSource>
    </MapboxGL.MapView>
  );

  return (
    <View style={styles.page}>
      {InputContainer}
      <View style={styles.container}>{MapBoxView}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 5,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  searchGroup: {
    flexDirection: 'row',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  radioItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1.75,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: 'blue',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    position: 'relative',
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
