export function getBaltimoreCoordinates(address: string) {
  const map = {
    'light st': { lat: 39.2905, lng: -76.6105 },
    'york rd': { lat: 39.394, lng: -76.623 },
    'pratt st': { lat: 39.2851, lng: -76.6083 },
    'shawan rd': { lat: 39.485, lng: -76.657 },
    'success st': { lat: 38.9784, lng: -76.4951 },
  };

  const match = Object.keys(map).find(key => address.toLowerCase().includes(key));
  return match ? map[match] : {
    lat: 39.2904 + (Math.random() - 0.5) * 0.1,
    lng: -76.6122 + (Math.random() - 0.5) * 0.1
  };
}
