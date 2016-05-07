import { normalize, Schema, arrayOf } from 'normalizr'
/* @flow */
// ------------------------------------
// Constants
// ------------------------------------
export const AUDIT_SUBMIT = 'AUDIT_SUBMIT'
export const AUDIT_SAVED = 'AUDIT_SAVED'
export const AUDITS_REQUEST = 'AUDITS_REQUEST'
export const AUDITS_RECEIVED = 'AUDITS_RECEIVED'
export const AUDIT_FORM_SAVE = 'AUDIT_FORM_SAVE'
export const AUDIT_FORM_RESET = 'AUDIT_FORM_RESET'
export const PERSIST_FEATURE = 'PERSIST_FEATURE'

const audit = new Schema('audits')
audit.define({
  geoCoordinates: geoCoordinates,
  sourceInformation: sourceInformation,
  parcelDescription: parcelDescription,
  workbooks: workbooks
})
const geoCoordinates = new Schema('geoCoordinates')
const sourceInformation = new Schema('sourceInformation')
// sourceInformation.define({
//   author: '',
//   date: '',
//   neighborhoodID: '',
//   timeHorizon: ''
// })
const parcelDescription = new Schema('parcelDescription')
const parcelIdentification = new Schema('parcelIdentification')
const buildingData = new Schema('buildingData')
const demographics = new Schema('demographics')
const demographicInputs = new Schema('demographicInputs')
// parcelIdentification.define({
//   parcelType: '',
//   designatedLandUse: '',
//   actualLandUse: '',
//   parcelArea: '',
//   buildingFootprint: ''
// })
// buildingData.define({
//   buildingAttachmentType: '',
//   numberOccupiedDwellingUnits: '',
//   buildingAge: '',
//   aboveGroundStories: '',
//   belowGroundStories: '',
//   interiorFloorSpace: '',
//   separateDwellingUnits: '',
//   foundationType: '',
//   wallType: '',
//   roofType: ''
// })
demographics.define({
  seniors: demographicInputs,
  adults: demographicInputs,
  youth: demographicInputs
})
// demographicInputs.define({
//   livingWorking: '',
//   livingOffsiteWorking: '',
//   visitingFullTimeWork: '',
//   visitingPartTimeWork: ''
// })
parcelDescription.define({
  parcelIdentification: parcelIdentification,
  buildingData: buildingData,
  demographics: demographics
})
const workbooks = new Schema('workbooks')

// ------------------------------------
// Actions
// ------------------------------------
// NOTE: "Action" is a Flow interface defined in https://github.com/TechnologyAdvice/flow-interfaces
// If you're unfamiliar with Flow, you are completely welcome to avoid annotating your code, but
// if you'd like to learn more you can check out: flowtype.org.
// DOUBLE NOTE: there is currently a bug with babel-eslint where a `space-infix-ops` error is
// incorrectly thrown when using arrow functions, hence the oddity.

function auditSubmit (responses): Action {
  return {
    type: AUDIT_SUBMIT,
    isFetching: true,
    responses
  }
}

function auditSaved (): Action {
  return {
    type: AUDIT_SAVED,
    isFetching: false
  }
}

function auditsRequest (bounds): Action {
  return {
    type: AUDITS_REQUEST,
    isFetching: true,
    bounds
  }
}

function auditsReceived (surveys): Action {
  return {
    type: AUDITS_RECEIVED,
    isFetching: false,
    surveys
  }
}

function auditFormSave (responses): Action {
  return {
    type: AUDIT_FORM_SAVE,
    responses
  }
}

function auditFormReset (): Action {
  return {
    type: AUDIT_FORM_RESET
  }
}

function persistFeatureGeoJSON (featureGeoJSON): Action {
  return {
    type: PERSIST_FEATURE,
    featureGeoJSON
  }
}

export function requestAudits (bounds) {
  let config = {
    method: 'GET',
    headers: new Headers(),
    mode: 'cors',
    cache: 'default'
  }
  let queryString = 'http://localhost:3000/api/audits?a=' +
    `${bounds[0]}&b=${bounds[1]}&c=${bounds[2]}&d=${bounds[3]}&e=${bounds[4]}`
  return (dispatch) => {
    dispatch(auditsRequest(bounds))
    return fetch(queryString, config)
      .then((response) => response.json()).then((audits) => dispatch(auditsReceived(audits)))
  }
}

export function auditSave (responses) {
  let config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `lat=${responses.geoCoordinates[1]}&lon=${responses.geoCoordinates[0]}&employment=${responses.employment}&healthcare=${responses.healthcare}&family=${responses.family}&stability=${responses.stability}&relationships=${responses.relationships}&recreation=${responses.recreation}&education=${responses.education}&vacation=${responses.vacation}&housing=${responses.housing}&environment=${responses.environment}&discrimination=${responses.discrimination}&religion=${responses.religion}&mobility=${responses.mobility}&movement=${responses.movement}&safety=${responses.safety}&governance=${responses.governance}&`
    // body: responses
  }
  return (dispatch) => {
    dispatch(auditSubmit(responses))
    return fetch('http://localhost:3000/api/audit/create', config)
      .then((response) => dispatch(auditSaved))
  }
}

export function persistFeature (featureGeoJSON) {
  return (dispatch) => {
    dispatch(persistFeatureGeoJSON(featureGeoJSON))
  }
}

export function saveAuditForm (responses) {
  return (dispatch) => {
    dispatch(auditFormSave(responses))
  }
}

export function resetAuditForm () {
  return (dispatch) => {
    dispatch(auditFormReset())
  }
}
// This is a thunk, meaning it is a function that immediately
// returns a function for lazy evaluation. It is incredibly useful for
// creating async actions, especially when combined with redux-thunk!
// NOTE: This is solely for demonstration purposes. In a real application,
// you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
// reducer take care of this logic.
// export const doubleAsync = (): Function => {
//   return (dispatch: Function, getState: Function): Promise => {
//     return new Promise((resolve: Function): void => {
//       setTimeout(() => {
//         dispatch(increment(getState().counter))
//         resolve()
//       }, 200)
//     })
//   }
// }

export const actions = {
  auditSubmit,
  auditSaved,
  auditsRequest,
  auditsReceived,
  auditFormSave,
  auditFormReset,
  persistFeatureGeoJSON
}

// ------------------------------------
// Action Handlers
// ------------------------------------
// const ACTION_HANDLERS = {
//   [COUNTER_INCREMENT]: (state: number, action: {payload: number}): number => state + action.payload
// }

// ------------------------------------
// Reducer
// ------------------------------------
// const initialState = 0
// export default function counterReducer (state: number = initialState, action: Action): number {
//   const handler = ACTION_HANDLERS[action.type]
//
//   return handler ? handler(state, action) : state
// }
export default function survey (state = {
  isFetching: false
}, action) {
  switch (action.type) {
    case AUDIT_SUBMIT:
      return Object.assign({}, state, {
        isFetching: true,
        auditResponses: action.responses
      })
    case AUDIT_SAVED:
      return Object.assign({}, state, {
        isFetching: false
      })
    case AUDITS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        bounds: action.bounds
      })
    case AUDITS_RECEIVED:
      return Object.assign({}, state, {
        isFetching: false,
        audits: action.surveys
      })
    case AUDIT_FORM_SAVE:
      // if (state.audit_form) console.log(normalize(state.audit_form, audit))
      let cumlatativeAudit
      state.audit_form
        ? cumlatativeAudit = Object.assign({}, state.audit_form, action.responses)
        : cumlatativeAudit = action.responses
      // console.log(cumlatativeAudit)
      return Object.assign({}, state, {
        inProgress: true,
        audit_form: cumlatativeAudit
      })
    case AUDIT_FORM_RESET:
      return Object.assign({}, state, {
        audit: {},
        feature: {}
      })
    case PERSIST_FEATURE:
      return Object.assign({}, state, {
        feature: action.featureGeoJSON
      })
    default:
      return state
  }
}