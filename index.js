const express = require('express');
const {Pool} = require('pg');
const cors = require('cors');

const app = express();
app.use(cors({}));

const pool = new Pool({
  user: 'programmer',
  host: 'localhost',
  database: 'map_render_test',
  password: 'justcode',
  port: 5432,
});

// Serve GeoJSON for various datasets
const getGeoJson = (table) => async (req, res) => {
  try {
    const result = await pool.query(`SELECT ST_AsGeoJSON(wkb_geometry) as geojson
                                     FROM ${table};`);
    const geoJsonData = result.rows.map(row => JSON.parse(row.geojson));
    const geoJsonFeatureCollection = {
      type: "FeatureCollection",
      features: geoJsonData.map(geometry => ({
        type: "Feature",
        geometry
      }))
    };
    res.json(geoJsonFeatureCollection);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data');
  }
};

// Routes for different datasets
app.get('/api/geojson/buildings', getGeoJson('building_polygon'));
app.get('/api/geojson/roads', getGeoJson('highway_line'));
app.get('/api/geojson/water', getGeoJson('water_polygon'));
app.get('/api/geojson/airports', getGeoJson('airport_polygon'));
app.get('/api/geojson/railways', getGeoJson('railway_line'));
app.get('/api/geojson/boundaries', getGeoJson('boundary_polygon'));
app.get('/api/geojson/landuse', getGeoJson('landuse_polygon'));
app.get('/api/geojson/nature_reserves', getGeoJson('nature_reserve_polygon'));

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

