import { DeleteTwoTone, EditOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Card, Popconfirm, notification } from 'antd';
import React from 'react';
import { ITvLibrary } from '../../../app/entities';
import { useAppDispatch, useAppSelector } from '../../../app/hook';
import { hamsterySlice } from '../../api/hamsterySlice';
import { responsiveComputeSelector, useResponsiveCardSize } from '../../general/responsiveSlice';
import { tvLibraryActions } from './tvlibrarySlice';

const TvLibraryCard: React.FC<{ library: ITvLibrary }> = ({ library }) => {
    const dispatch = useAppDispatch()
    const modeCompute = useAppSelector(responsiveComputeSelector)
    const [remove, { isLoading }] = hamsterySlice.useRemoveTvLibraryMutation()

    const width = useResponsiveCardSize(modeCompute)

    return <Card
        style={{ width }}
        actions={[
            <EditOutlined key="edit"
                onClick={() => dispatch(tvLibraryActions.edit(String(library.id)))}
            />,
            <FolderAddOutlined key="storage"
                onClick={() => dispatch(tvLibraryActions.editStorage(String(library.id)))}
            />,
            <Popconfirm title='Are you sure you want to delete this TV Library?'
                onConfirm={async () => {
                    if (!isLoading) {
                        try {
                            await remove(String(library.id)).unwrap()
                        } catch {
                            notification.error({ message: 'Failed to remove TV Library' })
                        }
                    }
                }}
            >
                <DeleteTwoTone key="delete" twoToneColor="#eb2f96" />
            </Popconfirm>,
        ]}
    >
        <Card.Meta title={library.name} description={`Language: ${library.lang}`} />
    </Card>
}

export default TvLibraryCard