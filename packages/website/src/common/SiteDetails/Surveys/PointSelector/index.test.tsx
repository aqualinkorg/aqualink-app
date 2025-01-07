import { renderWithProviders } from 'utils/test-utils';
import PointSelector from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <PointSelector
      siteId={1}
      pointOptions={[]}
      point="All"
      pointId={-1}
      editSurveyPointNameDraft={null}
      isSiteAdmin={false}
      editSurveyPointNameLoading={false}
      onChangeSurveyPointName={() => {}}
      handlePointChange={() => {}}
      disableeditSurveyPointName={() => {}}
      enableeditSurveyPointName={() => {}}
      submitSurveyPointNameUpdate={() => {}}
      onDeleteButtonClick={() => {}}
    />,
  );
  expect(container).toMatchSnapshot();
});
