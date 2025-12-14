import { Factory, Seeder } from 'typeorm-seeding';
import { times } from 'lodash';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { Sources } from '../sites/sources.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.enum';

export class CreateSite implements Seeder {
  public async run(factory: Factory) {
    const site = await factory(Site)().create();

    const startDate = new Date(2020, 1, 1);
    const dates = times(10, (i) => {
      const date = new Date();
      date.setDate(startDate.getDate() + i);
      return date;
    });

    await Promise.all(
      dates.map((date) =>
        factory(DailyData)()
          .map(async (dailyData) => {
            dailyData.date = date;
            dailyData.site = site;
            return dailyData;
          })
          .create(),
      ),
    );

    const surveyPoints = await Promise.all(
      times(4, () =>
        factory(SiteSurveyPoint)()
          .map(async (surveyPoint) => {
            surveyPoint.site = site;
            return surveyPoint;
          })
          .create(),
      ),
    );

    const metrics = [
      Metric.ALERT,
      Metric.DHW,
      Metric.SATELLITE_TEMPERATURE,
      Metric.TOP_TEMPERATURE,
      Metric.BOTTOM_TEMPERATURE,
      Metric.SST_ANOMALY,
    ];

    const sources = await Promise.all(
      surveyPoints.map((surveyPoint) =>
        factory(Sources)()
          .map(async (data) => {
            data.site = site;
            data.surveyPoint = surveyPoint;
            data.type = SourceType.HOBO;
            return data;
          })
          .create(),
      ),
    );

    const sourcesMap: { [k: number]: Sources } = Object.fromEntries(
      sources.map((source) => [source.surveyPoint!.id, source]),
    );

    await Promise.all(
      times(1000, () =>
        factory(TimeSeries)()
          .map(async (data) => {
            const metricId = Math.floor(Math.random() * 5);
            const surveyPointId = Math.floor(Math.random() * 4);
            data.source = sourcesMap[surveyPoints[surveyPointId].id];
            data.metric = metrics[metricId];
            return data;
          })
          .create(),
      ),
    );
  }
}
