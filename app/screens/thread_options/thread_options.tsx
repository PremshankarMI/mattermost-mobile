// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useManagedConfig} from '@mattermost/react-native-emm';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {CopyPermalinkOption, FollowThreadOption, ReplyOption, SaveOption} from '@components/common_post_options';
import FormattedText from '@components/formatted_text';
import {ITEM_HEIGHT} from '@components/option_item';
import {Screens} from '@constants';
import {useTheme} from '@context/theme';
import {useIsTablet} from '@hooks/device';
import useNavButtonPressed from '@hooks/navigation_button_pressed';
import BottomSheet from '@screens/bottom_sheet';
import {dismissModal} from '@screens/navigation';
import {bottomSheetSnapPoint} from '@utils/helpers';
import {makeStyleSheetFromTheme} from '@utils/theme';
import {typography} from '@utils/typography';

import {TITLE_HEIGHT} from '../bottom_sheet/content';

import MarkAsUnreadOption from './options/mark_as_unread_option';
import OpenInChannelOption from './options/open_in_channel_option';

import type PostModel from '@typings/database/models/servers/post';
import type TeamModel from '@typings/database/models/servers/team';
import type ThreadModel from '@typings/database/models/servers/thread';

type ThreadOptionsProps = {
    componentId: string;
    isSaved: boolean;
    post: PostModel;
    team: TeamModel;
    thread: ThreadModel;
};

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        listHeader: {
            marginBottom: 8,
        },
        listHeaderText: {
            color: theme.centerChannelColor,
            ...typography('Heading', 600, 'SemiBold'),
        },
    };
});

const THREAD_OPTIONS_BUTTON = 'close-thread-options';

const ThreadOptions = ({
    componentId,
    isSaved,
    post,
    team,
    thread,
}: ThreadOptionsProps) => {
    const theme = useTheme();
    const isTablet = useIsTablet();
    const {bottom} = useSafeAreaInsets();
    const style = getStyleSheet(theme);

    const close = () => {
        dismissModal({componentId});
    };

    useNavButtonPressed(THREAD_OPTIONS_BUTTON, componentId, close, []);

    const options = [
        <ReplyOption
            key='reply'
            location={Screens.THREAD_OPTIONS}
            post={post}
        />,
        <FollowThreadOption
            key='unfollow'
            thread={thread}
        />,
        <OpenInChannelOption
            key='open-in-channel'
            threadId={thread.id}
        />,
        <MarkAsUnreadOption
            key='mark-as-unread'
            teamId={team.id}
            thread={thread}
        />,
        <SaveOption
            key='save'
            isSaved={isSaved}
            postId={thread.id}
        />,
    ];

    const managedConfig = useManagedConfig<ManagedConfig>();
    const canCopyLink = managedConfig?.copyAndPasteProtection !== 'true';
    if (canCopyLink) {
        options.push(
            <CopyPermalinkOption
                key='copy-link'
                post={post}
                sourceScreen={Screens.THREAD_OPTIONS}
            />,
        );
    }

    const snapPoint = useMemo(() => TITLE_HEIGHT + bottomSheetSnapPoint(options.length, ITEM_HEIGHT, bottom), [bottom, options.length]);

    const renderContent = () => (
        <>
            {!isTablet && (
                <View style={style.listHeader}>
                    <FormattedText
                        id='global_threads.options.title'
                        defaultMessage={'Thread actions'}
                        style={style.listHeaderText}
                    />
                </View>
            )}
            {options}
        </>
    );

    return (
        <BottomSheet
            renderContent={renderContent}
            closeButtonId={THREAD_OPTIONS_BUTTON}
            componentId={Screens.THREAD_OPTIONS}
            initialSnapIndex={0}
            snapPoints={[snapPoint, 10]}
            testID='thread_options'
        />
    );
};

export default ThreadOptions;
