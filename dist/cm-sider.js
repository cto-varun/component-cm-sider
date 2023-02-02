"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ComponentCmSiderComponent;
var _react = _interopRequireWildcard(require("react"));
var _reactRouterDom = require("react-router-dom");
var _antd = require("antd");
var _icons = require("@ant-design/icons");
var _componentCreateCase = require("@ivoyant/component-create-case");
var _componentInteraction = _interopRequireDefault(require("@ivoyant/component-interaction"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _componentCache = require("@ivoyant/component-cache");
var _componentBulkRsa = _interopRequireDefault(require("@ivoyant/component-bulk-rsa"));
var _componentNewNotification = _interopRequireDefault(require("@ivoyant/component-new-notification"));
var _componentUnlockimeiTool = _interopRequireDefault(require("@ivoyant/component-unlockimei-tool"));
var _componentAcpStatus = _interopRequireDefault(require("@ivoyant/component-acp-status"));
var _voyageLogo = _interopRequireDefault(require("./assets/voyage-logo.png"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const {
  DirectoryTree
} = _antd.Tree;
const Timer = /*#__PURE__*/_react.default.memo(_ref => {
  let {
    events
  } = _ref;
  const {
    timerStartEvents,
    timerEndEvents
  } = events;
  const timerStarted = window[window.sessionStorage?.tabId].timerStarted ? window[window.sessionStorage?.tabId].timerStarted : false;
  const windowSeconds = window[window.sessionStorage?.tabId].timerSeconds ? window[window.sessionStorage?.tabId].timerSeconds : 0;
  const [seconds, setSeconds] = (0, _react.useState)(windowSeconds);
  const [started, setStarted] = (0, _react.useState)(timerStarted);
  const startInteraction = () => (subscriptionId, topic, eventData, closure) => {
    setSeconds(0);
    window[window.sessionStorage?.tabId].timerSeconds = 0;
    setStarted(true);
    window[window.sessionStorage?.tabId].timerStarted = true;
  };
  const stopTimer = () => (subscriptionId, topic, eventData, closure) => {
    setStarted(false);
    window[window.sessionStorage?.tabId].timerStarted = false;
  };
  (0, _react.useEffect)(() => {
    timerStartEvents.forEach(tse => {
      _componentMessageBus.MessageBus.subscribe('chat-timer.'.concat(tse), tse, startInteraction(), {});
    });
    timerEndEvents.forEach(tee => {
      _componentMessageBus.MessageBus.subscribe('chat-timer.'.concat(tee), tee, stopTimer(), {});
    });
    return () => {
      timerStartEvents.forEach(tse => {
        _componentMessageBus.MessageBus.unsubscribe('chat-timer.'.concat(tse));
      });
      timerEndEvents.forEach(tee => {
        _componentMessageBus.MessageBus.unsubscribe('chat-timer.'.concat(tee));
      });
    };
  }, []);
  (0, _react.useEffect)(() => {
    const timer = setInterval(() => {
      if (started || window[window.sessionStorage?.tabId].timerStarted) {
        setSeconds(prev => prev + 1);
        window[window.sessionStorage?.tabId].timerStarted = true;
        window[window.sessionStorage?.tabId].timerSeconds = seconds + 1;
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, started]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
});
function ComponentCmSiderComponent(_ref2) {
  let {
    data,
    properties,
    store,
    datasources
  } = _ref2;
  const {
    events,
    ebbProfiles,
    saveInteractionWorkflow,
    linkCaseWorkflow,
    caseCategoriesConfig,
    showMultipleTabs,
    submitInteractionWorkflow,
    uniphoreWorkflow,
    feedbackWorkflow
  } = properties;
  window[window.sessionStorage?.tabId]['datasourcesFromCMSider'] = datasources;
  const interactionCategories = data?.data?.interactionCategories?.categories || [];
  const caseCategories = data?.data?.caseCategories?.categories || [];
  const casePriorities = data?.data?.casePriorities?.categories || [];
  const caseAssignedTeam = data?.data?.caseAssignedTeam?.categories || [];
  const casePrivileges = data?.data?.casePrivileges?.categories || [];
  const interactionTags = data?.data?.interactionTags?.categories || [];
  const feedbackInfo = data?.data?.feedbackInfo?.categories || [];
  const [openCreateCase, setOpenCreateCase] = (0, _react.useState)(null);
  const [selectedQueues, setSelectedQueues] = (0, _react.useState)(null);
  const [selectedActivity, setSelectedActivity] = (0, _react.useState)(null);
  const history = (0, _reactRouterDom.useHistory)();
  const [showBulkRSAModal, setShowBulkRSAModal] = (0, _react.useState)(false);
  const [showNewNotification, setShowNewNotification] = (0, _react.useState)(false);
  const [showUnlockImei, setShowUnlockImei] = (0, _react.useState)(false);
  const [showAcpstatus, setShowAcpstatus] = (0, _react.useState)(false);
  const createCasePrevValues = sessionStorage.getItem('createCaseData') ? JSON.parse(sessionStorage.getItem('createCaseData')) : null;
  const [activities, setActivities] = (0, _react.useState)(localStorage.getItem('recentActivity') ? JSON.parse(localStorage.getItem('recentActivity')) : []);
  let {
    attId,
    profile
  } = window[window.sessionStorage?.tabId].COM_IVOYANT_VARS;
  const defaultInteractionData = data?.data?.profilesInfo?.profiles?.find(_ref3 => {
    let {
      name
    } = _ref3;
    return name === profile;
  })?.categories?.find(_ref4 => {
    let {
      name
    } = _ref4;
    return name === 'defaultInteractionProperties';
  }) || {};
  const profilePrivileges = casePrivileges?.find(_ref5 => {
    let {
      name
    } = _ref5;
    return name === profile;
  });
  const createPrivileges = profilePrivileges?.categories?.find(_ref6 => {
    let {
      name
    } = _ref6;
    return name === 'Create';
  });
  const viewPrivileges = profilePrivileges?.categories?.find(_ref7 => {
    let {
      name
    } = _ref7;
    return name === 'View';
  });
  const ViewFromPrivileges = viewPrivileges?.viewFrom;
  const interaction = _componentCache.cache.get('interaction');
  const {
    interactionId = '',
    ctn = '',
    ban = '',
    agentId = ''
  } = interaction || {};
  if (store?.response?.['test-component-get-chats']) {
    Object.assign(properties, store?.response?.['test-component-get-chats']);
  }
  const {
    messages: defaultMessages = []
  } = properties;
  const [messages, setMessages] = (0, _react.useState)(defaultMessages);
  const [saveInteractionModalVisible, setSaveInteractionModalVisible] = (0, _react.useState)(false);
  const [saveInteractionInitialized, setSaveInteractionInitialized] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    window[window.sessionStorage?.tabId].triggerSaveInteraction = triggerSaveInteraction;
    if (events && events.showInteraction) {
      _componentMessageBus.MessageBus.subscribe('chatter.'.concat(events.showInteraction), events.showInteraction, handleInteractionShow(), {});
    }
    return () => {
      if (window[window.sessionStorage?.tabId].triggerSaveInteraction) {
        delete window[window.sessionStorage?.tabId].triggerSaveInteraction;
      }
      if (events && events.showInteraction) {
        _componentMessageBus.MessageBus.unsubscribe('chatter.'.concat(events.showInteraction));
      }
    };
  }, []);
  const handleShowBulkRSA = () => (subscriptionId, topic, eventData, closure) => {
    setShowBulkRSAModal(true);
  };
  const handleShowNewNotification = () => (subscriptionId, topic, eventData, closure) => {
    setShowNewNotification(true);
  };
  (0, _react.useEffect)(() => {
    if (events && events.showBulkRSA) {
      _componentMessageBus.MessageBus.subscribe('chatter.'.concat(events.showBulkRSA), events.showBulkRSA, handleShowBulkRSA(), {});
    }
    return () => {
      if (events && events.showBulkRSA) {
        _componentMessageBus.MessageBus.unsubscribe('chatter.'.concat(events.showBulkRSA));
      }
    };
  }, []);
  (0, _react.useEffect)(() => {
    if (events && events.showNewNotification) {
      _componentMessageBus.MessageBus.subscribe('chatter.'.concat(events.showNewNotification), events.showNewNotification, handleShowNewNotification(), {});
    }
    return () => {
      if (events && events.showNewNotification) {
        _componentMessageBus.MessageBus.unsubscribe('chatter.'.concat(events.showNewNotification));
      }
    };
  }, []);
  (0, _react.useEffect)(prev => {
    if (interaction && !saveInteractionModalVisible && interactionId !== '') {
      if (events && events.hideInteraction) {
        _componentMessageBus.MessageBus.send(events.hideInteraction, {
          header: {
            source: 'chatter',
            event: events.hideInteraction
          },
          body: {
            task: 'Interaction '.concat(interactionId)
          }
        });
      }
    }
  }, [saveInteractionModalVisible]);
  const triggerSaveInteraction = () => {
    setSaveInteractionModalVisible(true);
    setSaveInteractionInitialized(true);
  };
  const handleInteractionShow = () => (subscriptionId, topic, eventData, closure) => {
    triggerSaveInteraction();
  };

  // Tooltip and title for component tree
  const Title = _ref8 => {
    let {
      title
    } = _ref8;
    return viewPrivileges ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, title) : /*#__PURE__*/_react.default.createElement(_antd.Tooltip, {
      title: "Profile does not have privileges"
    }, ' ', /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, title));
  };
  let mappedData = viewPrivileges ? ViewFromPrivileges ? ViewFromPrivileges?.map((name, index) => {
    return {
      title: name,
      key: name,
      index: `0-1-${index}`,
      children: null
    };
  }) : caseAssignedTeam?.map((_ref9, index) => {
    let {
      name
    } = _ref9;
    return {
      title: /*#__PURE__*/_react.default.createElement(Title, {
        title: name
      }),
      key: name,
      index: `0-1-${index}`,
      children: null
    };
  }) : [];
  let treeData = [{
    title: /*#__PURE__*/_react.default.createElement(Title, {
      title: 'My Work'
    }),
    key: 'My Work',
    index: '0-0',
    selectable: false,
    disabled: !viewPrivileges,
    children: [{
      title: /*#__PURE__*/_react.default.createElement(Title, {
        title: 'Cases assigned to me'
      }),
      key: 'AssignedToMe',
      disabled: !viewPrivileges,
      index: '0-0-1'
    }]
  }, {
    title: /*#__PURE__*/_react.default.createElement(Title, {
      title: 'My Queues'
    }),
    key: 'My Queues',
    index: '0-1',
    selectable: false,
    disabled: !viewPrivileges,
    children: mappedData
  }];

  // // if (ebbProfiles.includes(profile)) {
  //     treeData.push({
  //         title: 'EBB',
  //         key: 'EBB',
  //         index: '0-2',
  //         children: null,
  //     });
  // // }

  (0, _react.useEffect)(() => {
    if (selectedQueues) {
      if (!window.location.pathname.includes('/case-management')) {
        history.push('/dashboards/case-management', {
          routeData: {
            queueData: selectedQueues?.includes('AssignedToMe') ? {
              assignedTo: attId
            } : {
              assignedTeam: selectedQueues[0]
            }
          }
        });
      } else {
        _componentMessageBus.MessageBus.send('CM.QUEUE.SELECT', {
          header: {
            eventType: 'CM.QUEUE.SELECT'
          },
          body: {
            selectedQueues: selectedQueues
          }
        });
      }
    }
  }, [selectedQueues]);
  (0, _react.useEffect)(() => {
    if (selectedActivity) {
      if (!window.location.pathname.includes('/case-management')) {
        history.push('/dashboards/case-management', {
          routeData: {
            queueData: {
              caseId: selectedActivity
            }
          }
        });
      } else {
        _componentMessageBus.MessageBus.send('CM.QUEUE.SELECT', {
          header: {
            eventType: 'CM.QUEUE.SELECT'
          },
          body: {
            activity: selectedActivity
          }
        });
      }
    }
  }, [selectedActivity]);
  (0, _react.useEffect)(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('recentActivity') && JSON.stringify(activities) !== localStorage.getItem('recentActivity')) {
        const values = localStorage.getItem('recentActivity') ? JSON.parse(localStorage.getItem('recentActivity')) : [];
        setActivities(values);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  (0, _react.useEffect)(() => {
    let newNotificationData = _componentCache.cache.get('WhatsNewNotificationData');
    if (newNotificationData?.releaseInfo === undefined) {
      getNewNotifications();
    } else {
      _componentMessageBus.MessageBus.send('GETNOTIFICATIONDATA', newNotificationData);
      if (!newNotificationData?.notificationSeen && !_componentCache.cache.get('FirstTimeNotificationSeen')) {
        setShowNewNotification(true);
        setTimeout(() => {
          _componentCache.cache.put('FirstTimeNotificationSeen', true);
        }, 5000);
      }
    }
  }, []);
  const handleSelectedQueues = keys => {
    setSelectedQueues(keys);
    setSelectedActivity(null);
  };
  const handleSelectActivity = id => {
    setSelectedQueues(null);
    setSelectedActivity(id);
  };
  const handleNewNotifications = () => (subscriptionId, topic, eventData, closure) => {
    const status = eventData.value;
    const {
      successStates,
      errorStates
    } = properties?.newNotificationWorkflow;
    const isSuccess = successStates.includes(status);
    const isFailure = errorStates.includes(status);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        _componentCache.cache.put('WhatsNewNotificationData', eventData?.event?.data?.data);
        _componentMessageBus.MessageBus.send('GETNOTIFICATIONDATA', eventData?.event?.data?.data);
        if (!eventData?.event?.data?.data?.notificationSeen && !_componentCache.cache.get('FirstTimeNotificationSeen')) {
          setShowNewNotification(true);
        }
      }
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };
  const getNewNotifications = () => {
    const {
      workflow,
      datasource,
      responseMapping
    } = properties?.newNotificationWorkflow;
    const registrationId = workflow.concat('.').concat(attId);
    _componentMessageBus.MessageBus.subscribe(registrationId, 'WF.'.concat(workflow).concat('.STATE.CHANGE'), handleNewNotifications());
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'INIT'
      }
    });
    _componentMessageBus.MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
      header: {
        registrationId: registrationId,
        workflow: workflow,
        eventType: 'SUBMIT'
      },
      body: {
        datasource: datasources[datasource],
        request: {
          params: {
            agentId: attId
          }
        },
        responseMapping
      }
    });
  };
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "cm-sider-wrapper d-flex flex-column"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "header-title margin-bottom"
  }, /*#__PURE__*/_react.default.createElement("img", {
    className: "voyage-logo",
    src: _voyageLogo.default,
    alt: "Logo"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "empty-placeholder"
  }, "\xA0"), /*#__PURE__*/_react.default.createElement("div", {
    className: "dotted-divider"
  }), /*#__PURE__*/_react.default.createElement(Timer, {
    events: events
  }), createPrivileges && /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-row create-case"
  }, /*#__PURE__*/_react.default.createElement("div", null), /*#__PURE__*/_react.default.createElement(_antd.Button, {
    style: {
      background: '#52c41a',
      border: 'none'
    },
    type: "primary",
    onClick: setOpenCreateCase
  }, "Create Case")), /*#__PURE__*/_react.default.createElement(_componentCreateCase.CreateCaseModal, {
    properties: {
      visible: openCreateCase,
      cmMode: true,
      agentId: attId,
      caseCategories,
      casePriorities,
      caseAssignedTeam,
      casePrivileges,
      caseCategoriesConfig,
      createCaseWorkflow: properties?.createCaseWorkflow || null,
      categoryConditionsForImei: properties?.categoryConditionsForImei || [],
      categoryConditionsForCTN: properties?.categoryConditionsForCTN || []
    },
    datasources: datasources,
    setCreateCase: setOpenCreateCase
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "subtitle d-flex flex-row justify-content-between"
  }, /*#__PURE__*/_react.default.createElement("div", null, "Case Queues"), /*#__PURE__*/_react.default.createElement(_icons.CloseSquareOutlined, {
    title: "Clear selected",
    onClick: () => handleSelectedQueues([])
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "tree-data"
  }, /*#__PURE__*/_react.default.createElement(DirectoryTree, {
    selectedKeys: selectedQueues,
    defaultExpandAll: true,
    treeData: treeData,
    onSelect: keys => handleSelectedQueues(keys)
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "subtitle d-flex flex-row justify-content-between align-items-center"
  }, /*#__PURE__*/_react.default.createElement("div", null, "Recent Activity")), /*#__PURE__*/_react.default.createElement("div", {
    className: "activity-data "
  }, viewPrivileges && activities?.length > 0 ? /*#__PURE__*/_react.default.createElement(_antd.List, {
    dataSource: activities,
    renderItem: id => /*#__PURE__*/_react.default.createElement(_antd.List.Item, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
      type: "text",
      block: true,
      onClick: () => handleSelectActivity(id)
    }, id))
  }) : /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex flex-column empty-activity align-items-center"
  }, /*#__PURE__*/_react.default.createElement(_icons.FallOutlined, null), /*#__PURE__*/_react.default.createElement("div", null, !viewPrivileges ? 'Profile does not have privileges' : 'No Recent Activities'))), createCasePrevValues && /*#__PURE__*/_react.default.createElement(_antd.Button, {
    className: "create-case-in-progess",
    type: "primary",
    onClick: setOpenCreateCase
  }, /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "Create case is in progress...", ' ', /*#__PURE__*/_react.default.createElement(_icons.FullscreenOutlined, {
    style: {
      fontSize: 18
    }
  }))), /*#__PURE__*/_react.default.createElement(_componentInteraction.default, {
    properties: {
      visible: saveInteractionModalVisible,
      showMultipleTabs,
      interactionCategories,
      saveInteractionWorkflow,
      linkCaseWorkflow,
      createPrivileges,
      submitInteractionWorkflow,
      datasources,
      uniphoreWorkflow,
      feedbackWorkflow
    },
    setSaveInteractionModalVisible: setSaveInteractionModalVisible,
    setSubmitInteraction: () => {},
    messages: messages,
    events: events,
    interactionTags: interactionTags,
    defaultInteractionData: defaultInteractionData,
    feedbackInfo: feedbackInfo
  }), /*#__PURE__*/_react.default.createElement(_componentBulkRsa.default, {
    visible: showBulkRSAModal,
    setShowBulkRSAModal: setShowBulkRSAModal,
    properties: {
      bulkRsaWorkflow: properties?.bulkRsaWorkflow || null
    },
    datasources: datasources
  }), /*#__PURE__*/_react.default.createElement(_componentNewNotification.default, {
    visible: showNewNotification,
    setShowNewNotification: setShowNewNotification
  }), /*#__PURE__*/_react.default.createElement(_componentUnlockimeiTool.default, {
    visible: showUnlockImei,
    setShowUnlockImei: setShowUnlockImei,
    datasources: datasources,
    properties: {
      unlockImeikSearchWorkflow: properties?.unlockImeikSearchWorkflow || null,
      unlockImeikDevicehWorkflow: properties?.unlockImeikDevicehWorkflow || null
    },
    metadataProfile: data?.data?.profilesInfo,
    unlockOverrideReasons: data?.data?.unlockOverrideReasons
  }), /*#__PURE__*/_react.default.createElement(_componentAcpStatus.default, {
    visible: showAcpstatus,
    setShowAcpstatus: setShowAcpstatus,
    datasources: datasources,
    properties: {
      searchAcpAppStatusWorkflow: properties?.searchAcpAppStatusWorkflow || null
    }
  }));
}
module.exports = exports.default;