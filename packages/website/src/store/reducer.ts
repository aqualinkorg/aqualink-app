import { combineReducers } from 'redux';
import selectedSite from './Sites/selectedSiteSlice';
import sitesList from './Sites/sitesListSlice';
import homepage from './Homepage/homepageSlice';
import user from './User/userSlice';
import survey from './Survey/surveySlice';
import surveyList from './Survey/surveyListSlice';
import collection from './Collection/collectionSlice';
import uploads from './uploads/uploadsSlice';

const appReducer = combineReducers({
  selectedSite,
  sitesList,
  homepage,
  user,
  collection,
  survey,
  surveyList,
  uploads,
});

export default appReducer;
