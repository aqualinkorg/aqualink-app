import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import PointSelector from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
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
      />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
