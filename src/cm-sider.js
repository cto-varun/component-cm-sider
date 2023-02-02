import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Tree, List, Button, Tooltip } from 'antd';
import {
    FallOutlined,
    FullscreenOutlined,
    CloseSquareOutlined,
} from '@ant-design/icons';
import {
    CreateCaseModal,
    OpenCasesModal,
} from '@ivoyant/component-create-case';
import Interaction from '@ivoyant/component-interaction';
import { MessageBus } from '@ivoyant/component-message-bus';
import { cache } from '@ivoyant/component-cache';

import BulkRsa from '@ivoyant/component-bulk-rsa';

import NewNotification from '@ivoyant/component-new-notification';

import UnlockImei from '@ivoyant/component-unlockimei-tool';
import Acpstatus from '@ivoyant/component-acp-status';

import logo from './assets/voyage-logo.png';

import './styles.css';

const { DirectoryTree } = Tree;

const Timer = React.memo(({ events }) => {
    const { timerStartEvents, timerEndEvents } = events;
    const timerStarted = window[window.sessionStorage?.tabId].timerStarted
        ? window[window.sessionStorage?.tabId].timerStarted
        : false;
    const windowSeconds = window[window.sessionStorage?.tabId].timerSeconds
        ? window[window.sessionStorage?.tabId].timerSeconds
        : 0;
    const [seconds, setSeconds] = useState(windowSeconds);
    const [started, setStarted] = useState(timerStarted);

    const startInteraction = () => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        setSeconds(0);
        window[window.sessionStorage?.tabId].timerSeconds = 0;
        setStarted(true);
        window[window.sessionStorage?.tabId].timerStarted = true;
    };

    const stopTimer = () => (subscriptionId, topic, eventData, closure) => {
        setStarted(false);
        window[window.sessionStorage?.tabId].timerStarted = false;
    };

    useEffect(() => {
        timerStartEvents.forEach((tse) => {
            MessageBus.subscribe(
                'chat-timer.'.concat(tse),
                tse,
                startInteraction(),
                {}
            );
        });

        timerEndEvents.forEach((tee) => {
            MessageBus.subscribe(
                'chat-timer.'.concat(tee),
                tee,
                stopTimer(),
                {}
            );
        });

        return () => {
            timerStartEvents.forEach((tse) => {
                MessageBus.unsubscribe('chat-timer.'.concat(tse));
            });

            timerEndEvents.forEach((tee) => {
                MessageBus.unsubscribe('chat-timer.'.concat(tee));
            });
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (started || window[window.sessionStorage?.tabId].timerStarted) {
                setSeconds((prev) => prev + 1);
                window[window.sessionStorage?.tabId].timerStarted = true;
                window[window.sessionStorage?.tabId].timerSeconds = seconds + 1;
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, started]);

    return <></>;
});

export default function ComponentCmSiderComponent({
    data,
    properties,
    store,
    datasources,
}) {
    const {
        events,
        ebbProfiles,
        saveInteractionWorkflow,
        linkCaseWorkflow,
        caseCategoriesConfig,
        showMultipleTabs,
        submitInteractionWorkflow,
        uniphoreWorkflow,
        feedbackWorkflow,
    } = properties;

    window[window.sessionStorage?.tabId][
        'datasourcesFromCMSider'
    ] = datasources;

    const interactionCategories =
        data?.data?.interactionCategories?.categories || [];
    const caseCategories = data?.data?.caseCategories?.categories || [];
    const casePriorities = data?.data?.casePriorities?.categories || [];
    const caseAssignedTeam = data?.data?.caseAssignedTeam?.categories || [];
    const casePrivileges = data?.data?.casePrivileges?.categories || [];
    const interactionTags = data?.data?.interactionTags?.categories || [];
    const feedbackInfo = data?.data?.feedbackInfo?.categories || [];
    const [openCreateCase, setOpenCreateCase] = useState(null);
    const [selectedQueues, setSelectedQueues] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const history = useHistory();
    const [showBulkRSAModal, setShowBulkRSAModal] = useState(false);
    const [showNewNotification, setShowNewNotification] = useState(false);
    const [showUnlockImei, setShowUnlockImei] = useState(false);
    const [showAcpstatus, setShowAcpstatus] = useState(false);
    const createCasePrevValues = sessionStorage.getItem('createCaseData')
        ? JSON.parse(sessionStorage.getItem('createCaseData'))
        : null;
    const [activities, setActivities] = useState(
        localStorage.getItem('recentActivity')
            ? JSON.parse(localStorage.getItem('recentActivity'))
            : []
    );

    let { attId, profile } = window[
        window.sessionStorage?.tabId
    ].COM_IVOYANT_VARS;
    const defaultInteractionData =
        data?.data?.profilesInfo?.profiles
            ?.find(({ name }) => name === profile)
            ?.categories?.find(
                ({ name }) => name === 'defaultInteractionProperties'
            ) || {};
    const profilePrivileges = casePrivileges?.find(
        ({ name }) => name === profile
    );

    const createPrivileges = profilePrivileges?.categories?.find(
        ({ name }) => name === 'Create'
    );

    const viewPrivileges = profilePrivileges?.categories?.find(
        ({ name }) => name === 'View'
    );
    const ViewFromPrivileges = viewPrivileges?.viewFrom;

    const interaction = cache.get('interaction');
    const { interactionId = '', ctn = '', ban = '', agentId = '' } =
        interaction || {};

    if (store?.response?.['test-component-get-chats']) {
        Object.assign(
            properties,
            store?.response?.['test-component-get-chats']
        );
    }

    const { messages: defaultMessages = [] } = properties;
    const [messages, setMessages] = useState(defaultMessages);
    const [
        saveInteractionModalVisible,
        setSaveInteractionModalVisible,
    ] = useState(false);

    const [
        saveInteractionInitialized,
        setSaveInteractionInitialized,
    ] = useState(false);

    useEffect(() => {
        window[
            window.sessionStorage?.tabId
        ].triggerSaveInteraction = triggerSaveInteraction;
        if (events && events.showInteraction) {
            MessageBus.subscribe(
                'chatter.'.concat(events.showInteraction),
                events.showInteraction,
                handleInteractionShow(),
                {}
            );
        }

        return () => {
            if (window[window.sessionStorage?.tabId].triggerSaveInteraction) {
                delete window[window.sessionStorage?.tabId]
                    .triggerSaveInteraction;
            }

            if (events && events.showInteraction) {
                MessageBus.unsubscribe(
                    'chatter.'.concat(events.showInteraction)
                );
            }
        };
    }, []);

    const handleShowBulkRSA = () => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        setShowBulkRSAModal(true);
    };

    const handleShowNewNotification = () => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        setShowNewNotification(true);
    };

    useEffect(() => {
        if (events && events.showBulkRSA) {
            MessageBus.subscribe(
                'chatter.'.concat(events.showBulkRSA),
                events.showBulkRSA,
                handleShowBulkRSA(),
                {}
            );
        }

        return () => {
            if (events && events.showBulkRSA) {
                MessageBus.unsubscribe('chatter.'.concat(events.showBulkRSA));
            }
        };
    }, []);

    useEffect(() => {
        if (events && events.showNewNotification) {
            MessageBus.subscribe(
                'chatter.'.concat(events.showNewNotification),
                events.showNewNotification,
                handleShowNewNotification(),
                {}
            );
        }

        return () => {
            if (events && events.showNewNotification) {
                MessageBus.unsubscribe(
                    'chatter.'.concat(events.showNewNotification)
                );
            }
        };
    }, []);

    useEffect(
        (prev) => {
            if (
                interaction &&
                !saveInteractionModalVisible &&
                interactionId !== ''
            ) {
                if (events && events.hideInteraction) {
                    MessageBus.send(events.hideInteraction, {
                        header: {
                            source: 'chatter',
                            event: events.hideInteraction,
                        },
                        body: {
                            task: 'Interaction '.concat(interactionId),
                        },
                    });
                }
            }
        },
        [saveInteractionModalVisible]
    );

    const triggerSaveInteraction = () => {
        setSaveInteractionModalVisible(true);
        setSaveInteractionInitialized(true);
    };

    const handleInteractionShow = () => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        triggerSaveInteraction();
    };

    // Tooltip and title for component tree
    const Title = ({ title }) => {
        return viewPrivileges ? (
            <>{title}</>
        ) : (
            <Tooltip title="Profile does not have privileges">
                {' '}
                <>{title}</>
            </Tooltip>
        );
    };

    let mappedData = viewPrivileges
        ? ViewFromPrivileges
            ? ViewFromPrivileges?.map((name, index) => {
                  return {
                      title: name,
                      key: name,
                      index: `0-1-${index}`,
                      children: null,
                  };
              })
            : caseAssignedTeam?.map(({ name }, index) => {
                  return {
                      title: <Title title={name} />,
                      key: name,
                      index: `0-1-${index}`,
                      children: null,
                  };
              })
        : [];

    let treeData = [
        {
            title: <Title title={'My Work'} />,
            key: 'My Work',
            index: '0-0',
            selectable: false,
            disabled: !viewPrivileges,
            children: [
                {
                    title: <Title title={'Cases assigned to me'} />,
                    key: 'AssignedToMe',
                    disabled: !viewPrivileges,
                    index: '0-0-1',
                },
            ],
        },
        {
            title: <Title title={'My Queues'} />,
            key: 'My Queues',
            index: '0-1',
            selectable: false,
            disabled: !viewPrivileges,
            children: mappedData,
        },
    ];

    // // if (ebbProfiles.includes(profile)) {
    //     treeData.push({
    //         title: 'EBB',
    //         key: 'EBB',
    //         index: '0-2',
    //         children: null,
    //     });
    // // }

    useEffect(() => {
        if (selectedQueues) {
            if (!window.location.pathname.includes('/case-management')) {
                history.push('/dashboards/case-management', {
                    routeData: {
                        queueData: selectedQueues?.includes('AssignedToMe')
                            ? { assignedTo: attId }
                            : {
                                  assignedTeam: selectedQueues[0],
                              },
                    },
                });
            } else {
                MessageBus.send('CM.QUEUE.SELECT', {
                    header: {
                        eventType: 'CM.QUEUE.SELECT',
                    },
                    body: {
                        selectedQueues: selectedQueues,
                    },
                });
            }
        }
    }, [selectedQueues]);

    useEffect(() => {
        if (selectedActivity) {
            if (!window.location.pathname.includes('/case-management')) {
                history.push('/dashboards/case-management', {
                    routeData: {
                        queueData: {
                            caseId: selectedActivity,
                        },
                    },
                });
            } else {
                MessageBus.send('CM.QUEUE.SELECT', {
                    header: {
                        eventType: 'CM.QUEUE.SELECT',
                    },
                    body: {
                        activity: selectedActivity,
                    },
                });
            }
        }
    }, [selectedActivity]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (
                localStorage.getItem('recentActivity') &&
                JSON.stringify(activities) !==
                    localStorage.getItem('recentActivity')
            ) {
                const values = localStorage.getItem('recentActivity')
                    ? JSON.parse(localStorage.getItem('recentActivity'))
                    : [];
                setActivities(values);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let newNotificationData = cache.get('WhatsNewNotificationData');
        if (newNotificationData?.releaseInfo === undefined) {
            getNewNotifications();
        } else {
            MessageBus.send('GETNOTIFICATIONDATA', newNotificationData);
            if (
                !newNotificationData?.notificationSeen &&
                !cache.get('FirstTimeNotificationSeen')
            ) {
                setShowNewNotification(true);
                setTimeout(() => {
                    cache.put('FirstTimeNotificationSeen', true);
                }, 5000);
            }
        }
    }, []);

    const handleSelectedQueues = (keys) => {
        setSelectedQueues(keys);
        setSelectedActivity(null);
    };

    const handleSelectActivity = (id) => {
        setSelectedQueues(null);
        setSelectedActivity(id);
    };

    const handleNewNotifications = () => (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
        const status = eventData.value;
        const {
            successStates,
            errorStates,
        } = properties?.newNotificationWorkflow;
        const isSuccess = successStates.includes(status);
        const isFailure = errorStates.includes(status);
        if (isSuccess || isFailure) {
            if (isSuccess) {
                cache.put(
                    'WhatsNewNotificationData',
                    eventData?.event?.data?.data
                );
                MessageBus.send(
                    'GETNOTIFICATIONDATA',
                    eventData?.event?.data?.data
                );
                if (
                    !eventData?.event?.data?.data?.notificationSeen &&
                    !cache.get('FirstTimeNotificationSeen')
                ) {
                    setShowNewNotification(true);
                }
            }
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    const getNewNotifications = () => {
        const {
            workflow,
            datasource,
            responseMapping,
        } = properties?.newNotificationWorkflow;
        const registrationId = workflow.concat('.').concat(attId);
        MessageBus.subscribe(
            registrationId,
            'WF.'.concat(workflow).concat('.STATE.CHANGE'),
            handleNewNotifications()
        );
        MessageBus.send('WF.'.concat(workflow).concat('.INIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'INIT',
            },
        });
        MessageBus.send('WF.'.concat(workflow).concat('.SUBMIT'), {
            header: {
                registrationId: registrationId,
                workflow: workflow,
                eventType: 'SUBMIT',
            },
            body: {
                datasource: datasources[datasource],
                request: {
                    params: { agentId: attId },
                },
                responseMapping,
            },
        });
    };

    return (
        <div className="cm-sider-wrapper d-flex flex-column">
            <div className="header-title margin-bottom">
                <img className="voyage-logo" src={logo} alt="Logo" />
            </div>
            <div className="empty-placeholder">&nbsp;</div>
            <div className="dotted-divider" />
            <Timer events={events} />
            {createPrivileges && (
                <div className="d-flex flex-row create-case">
                    <div></div>
                    <Button
                        style={{
                            background: '#52c41a',
                            border: 'none',
                        }}
                        type="primary"
                        onClick={setOpenCreateCase}
                    >
                        Create Case
                    </Button>
                </div>
            )}
            <CreateCaseModal
                properties={{
                    visible: openCreateCase,
                    cmMode: true,
                    agentId: attId,
                    caseCategories,
                    casePriorities,
                    caseAssignedTeam,
                    casePrivileges,
                    caseCategoriesConfig,
                    createCaseWorkflow: properties?.createCaseWorkflow || null,
                    categoryConditionsForImei:
                        properties?.categoryConditionsForImei || [],
                    categoryConditionsForCTN:
                        properties?.categoryConditionsForCTN || [],
                }}
                datasources={datasources}
                setCreateCase={setOpenCreateCase}
            />
            <div className="subtitle d-flex flex-row justify-content-between">
                <div>Case Queues</div>
                <CloseSquareOutlined
                    title="Clear selected"
                    onClick={() => handleSelectedQueues([])}
                />
            </div>
            <div className="tree-data">
                <DirectoryTree
                    selectedKeys={selectedQueues}
                    defaultExpandAll
                    treeData={treeData}
                    onSelect={(keys) => handleSelectedQueues(keys)}
                />
            </div>
            <div className="subtitle d-flex flex-row justify-content-between align-items-center">
                <div>Recent Activity</div>
            </div>
            <div className="activity-data ">
                {viewPrivileges && activities?.length > 0 ? (
                    <List
                        dataSource={activities}
                        renderItem={(id) => (
                            <List.Item>
                                <Button
                                    type="text"
                                    block
                                    onClick={() => handleSelectActivity(id)}
                                >
                                    {id}
                                </Button>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="d-flex flex-column empty-activity align-items-center">
                        <FallOutlined />
                        <div>
                            {!viewPrivileges
                                ? 'Profile does not have privileges'
                                : 'No Recent Activities'}
                        </div>
                    </div>
                )}
            </div>
            {createCasePrevValues && (
                <Button
                    className="create-case-in-progess"
                    type="primary"
                    onClick={setOpenCreateCase}
                >
                    <>
                        Create case is in progress...{' '}
                        <FullscreenOutlined style={{ fontSize: 18 }} />
                    </>
                </Button>
            )}
            <Interaction
                properties={{
                    visible: saveInteractionModalVisible,
                    showMultipleTabs,
                    interactionCategories,
                    saveInteractionWorkflow,
                    linkCaseWorkflow,
                    createPrivileges,
                    submitInteractionWorkflow,
                    datasources,
                    uniphoreWorkflow,
                    feedbackWorkflow,
                }}
                setSaveInteractionModalVisible={setSaveInteractionModalVisible}
                setSubmitInteraction={() => {}}
                messages={messages}
                events={events}
                interactionTags={interactionTags}
                defaultInteractionData={defaultInteractionData}
                feedbackInfo={feedbackInfo}
            />
            <BulkRsa
                visible={showBulkRSAModal}
                setShowBulkRSAModal={setShowBulkRSAModal}
                properties={{
                    bulkRsaWorkflow: properties?.bulkRsaWorkflow || null,
                }}
                datasources={datasources}
            />

            <NewNotification
                visible={showNewNotification}
                setShowNewNotification={setShowNewNotification}
            />
            <UnlockImei
                visible={showUnlockImei}
                setShowUnlockImei={setShowUnlockImei}
                datasources={datasources}
                properties={{
                    unlockImeikSearchWorkflow:
                        properties?.unlockImeikSearchWorkflow || null,
                    unlockImeikDevicehWorkflow:
                        properties?.unlockImeikDevicehWorkflow || null,
                }}
                metadataProfile={data?.data?.profilesInfo}
                unlockOverrideReasons={data?.data?.unlockOverrideReasons}
            />
            <Acpstatus
                visible={showAcpstatus}
                setShowAcpstatus={setShowAcpstatus}
                datasources={datasources}
                properties={{
                    searchAcpAppStatusWorkflow:
                        properties?.searchAcpAppStatusWorkflow || null,
                }}
            />
        </div>
    );
}
