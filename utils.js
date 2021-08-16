export const polygonToCoords = (polygonString = '') => {
  const coords = polygonString
    .slice(15, polygonString.length - 3)
    .split(',')
    .map(xy => xy.split(' ').map(c => parseFloat(c)));
  return coords;
};
