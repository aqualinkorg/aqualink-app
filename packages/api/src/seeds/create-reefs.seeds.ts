import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { Metrics } from '../time-series/metrics.entity';
import { Sources, SourceType } from '../reefs/sources.entity';

export class CreateReef implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    const reef = await factory(Reef)().create();

    const startDate = new Date(2020, 1, 1);
    const dates = [...Array(10).keys()].map((i) => {
      const date = new Date();
      date.setDate(startDate.getDate() + i);
      return date;
    });

    await Promise.all(
      dates.map((date) => {
        return factory(DailyData)()
          .map(async (dailyData) => {
            dailyData.date = date;
            dailyData.reef = reef;
            return dailyData;
          })
          .create();
      }),
    );

    const pois = await Promise.all(
      [...Array(4).keys()].map(() => {
        return factory(ReefPointOfInterest)()
          .map(async (poi) => {
            poi.reef = reef;
            return poi;
          })
          .create();
      }),
    );

    const metrics = await connection
      .createQueryBuilder()
      .from(Metrics, 'metric')
      .getRawMany();

    const sources = await Promise.all(
      pois.map((poi) => {
        return factory(Sources)()
          .map(async (data) => {
            data.reef = reef;
            data.poi = poi;
            data.type = SourceType.HOBO;
            return data;
          })
          .create();
      }),
    );

    const sourcesMap: { [k: number]: Sources } = Object.fromEntries(
      sources.map((source) => [source.poi.id, source]),
    );

    await Promise.all(
      [...Array(1000).keys()].map(() => {
        return factory(TimeSeries)()
          .map(async (data) => {
            const metricId = Math.floor(Math.random() * 5);
            const poiId = Math.floor(Math.random() * 4);
            data.reef = reef;
            data.poi = pois[poiId];
            data.source = sourcesMap[pois[poiId].id];
            data.metric = metrics[metricId];
            return data;
          })
          .create();
      }),
    );
  }
}
