import fs from 'fs/promises';
import xml2js from 'xml2js';

const parser = new xml2js.Parser();

const cities = {};

(async () => {
  try {
    const data = await fs.readFile('assets/data.xml');
    const result = await parser.parseStringPromise(data);
    const items = result['dataroot']['_x0031_050429_行政區經緯度_x0028_toPost_x0029_'];

    items.forEach((item) => {
      const name = String(item['行政區名'][0]);
      const city = name.slice(0, 3);
      const district = name.slice(3);

      if (!cities[city]) {
        cities[city] = {};
      }

      cities[city][district] = {
        postalCode: item['_x0033_碼郵遞區號'][0],
        longitude: item['中心點經度'][0],
        latitude: item['中心點緯度'][0],
      };
    });

    console.dir(cities);

    // v1
    await fs.writeFile('assets/output_v1.json', JSON.stringify({ '台灣': cities }, null, 2));

    const countries = [
      {
        name: '台灣',
        cities: Object.entries(cities).map(([key, districts]) => {
          return {
            name: key,
            districts: Object.entries(districts).map(([key, value]) => {
              return {
                name: key,
                ...value,
              };
            }),
          };
        }),
      },
    ];

    // v2
    await fs.writeFile('assets/output_v2.json', JSON.stringify({ countries }, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
