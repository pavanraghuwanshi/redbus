const axios = require('axios');

const fetchDataAndMerge = async () => {
  const auth = {
    username: 'apoorvatravels',
    password: '123456',
  };

  try {
    // Fetch data from both APIs
    const [positionsResponse, devicesResponse] = await Promise.all([
      axios.get('http://104.251.212.84/api/positions', { auth }),
      axios.get('http://104.251.212.84/api/devices', { auth }),
    ]);

    const positionsData = positionsResponse.data;
    const devicesData = devicesResponse.data;

    // Filter and merge data
    const mergedData = positionsData
      .filter((position) => [4986, 5467].includes(position.deviceId))
      .map((position) => {
        const device = devicesData.find((device) => device.id === position.deviceId);
        return {
          gpsId: device.uniqueId,
          timestamp: Math.floor(new Date(position.deviceTime).getTime() / 1000),
          lat: position.latitude,
          lng: position.longitude,
          speed: position.speed,
          ignitionStatus: position.attributes.ignition,
          address: position.address,
          deviceId: position.deviceId,
          vehicleNo: device.name,
        };
      });
    console.log(mergedData);
    await postData(mergedData);
  } catch (error) {
    console.error('Error fetching or merging data:', error);
  }
};

const postData = async (data) => {
  try {
    const res = await axios.post(
      'http://fleetdata.yourbus.in/api/gpsdata',
      data,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNyZWRlbmNlVHJhY2tlciIsInZlbmRvcm5hbWUiOiJDcmVkZW5jZVRyYWNrZXIiLCJpYXQiOjE3MDkyOTAyOTF9.Uax7uXw8nyES4c7K_cZieOtctM0piwi-mQgby1EFvnE`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(res.data);
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

// Run fetchDataAndMerge every 5 seconds
setInterval(fetchDataAndMerge, 5000);
