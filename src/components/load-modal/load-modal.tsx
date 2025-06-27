import React from 'react';
import { observer } from 'mobx-react-lite';
import { tabs_title } from '@/constants/load-modal';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { rudderStackSendSwitchLoadStrategyTabEvent } from '../../analytics/rudderstack-bot-builder';
import { rudderStackSendCloseEvent } from '../../analytics/rudderstack-common-events';
import { LOAD_MODAL_TABS } from '../../analytics/utils';
import MobileFullPageModal from '../shared_ui/mobile-full-page-modal';
import Modal from '../shared_ui/modal';
import Tabs from '../shared_ui/tabs';
import GoogleDrive from './google-drive';
import Local from './local';
import LocalFooter from './local-footer';
import Recent from './recent';
import RecentFooter from './recent-footer';

const LoadModal: React.FC = observer((): JSX.Element => {
    const { load_modal, dashboard } = useStore();
    const {
        active_index,
        is_load_modal_open,
        loaded_local_file,
        onEntered,
        recent_strategies,
        setActiveTabIndex,
        toggleLoadModal,
        tab_name,
    } = load_modal;
    const { setPreviewOnPopup } = dashboard;
    const { isDesktop } = useDevice();
    const header_text: string = localize('Load strategy');

    const handleTabItemClick = (active_index: number): void => {
        setActiveTabIndex(active_index);
        rudderStackSendSwitchLoadStrategyTabEvent({
            load_strategy_tab: LOAD_MODAL_TABS[active_index + (!isDesktop ? 1 : 0)],
        });
    };

    // Ensure loadFileFromContent is defined on load_modal
    load_modal.loadFileFromContent = async (xmlContent: string) => {
        try {
            console.log('Loading XML content:', xmlContent);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
            // Define the loadParsedXML method
            load_modal.loadParsedXML = (xmlDoc: Document) => {
                // Clear the existing workspace
                const workspace = Blockly.getMainWorkspace();
                workspace.clear();
                // Load the parsed XML into the bot builder
                Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
                console.log('Parsed XML loaded into workspace');
            };
            load_modal.loadParsedXML(xmlDoc);
        } catch (error) {
            console.error('Error loading XML content:', error);
        }
    };

    if (!isDesktop) {
        return (
            <MobileFullPageModal
                is_modal_open={is_load_modal_open}
                className='load-strategy__wrapper'
                header={header_text}
                onClickClose={() => {
                    setPreviewOnPopup(false);
                    toggleLoadModal();
                    rudderStackSendCloseEvent({
                        subform_name: 'load_strategy',
                        load_strategy_tab: LOAD_MODAL_TABS[active_index + 1],
                    });
                }}
                height_offset='80px'
                page_overlay
            >
                <Tabs active_index={active_index} onTabItemClick={handleTabItemClick} top>
                    <div label={localize('Local')}>
                        <Local />
                    </div>
                    <div label='Google Drive'>
                        <GoogleDrive />
                    </div>
                </Tabs>
            </MobileFullPageModal>
        );
    }

    const is_file_loaded: boolean = !!loaded_local_file && tab_name === tabs_title.TAB_LOCAL;
    const has_recent_strategies: boolean = recent_strategies.length > 0 && tab_name === tabs_title.TAB_RECENT;

    return (
        <Modal
            title={header_text}
            className='load-strategy'
            width='1000px'
            height='80vh'
            is_open={is_load_modal_open}
            toggleModal={() => {
                toggleLoadModal();
                rudderStackSendCloseEvent({
                    subform_name: 'load_strategy',
                    load_strategy_tab: LOAD_MODAL_TABS[active_index + (!isDesktop ? 1 : 0)],
                });
            }}
            onEntered={onEntered}
            elements_to_ignore={[document.querySelector('.injectionDiv') as Element]}
        >
            <Modal.Body>
                <Tabs active_index={active_index} onTabItemClick={handleTabItemClick} top header_fit_content>
                    <div label={localize('Recent')}>
                        <Recent />
                    </div>
                    <div label={localize('Local')}>
                        <Local />
                    </div>
                    <div label='Google Drive'>
                        <GoogleDrive />
                    </div>
                </Tabs>
            </Modal.Body>
            {has_recent_strategies && (
                <Modal.Footer has_separator>
                    <RecentFooter />
                </Modal.Footer>
            )}
            {is_file_loaded && (
                <Modal.Footer has_separator>
                    <LocalFooter />
                </Modal.Footer>
            )}
        </Modal>
    );
});

export default LoadModal;
