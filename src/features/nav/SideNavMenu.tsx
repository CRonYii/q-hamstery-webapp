import { Affix, Layout, Menu, SiderProps, Tooltip } from 'antd';
import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hook';
import { hamsterySlice } from '../api/hamsterySlice';
import { responsiveComputeSelector } from '../general/responsiveSlice';

const { Sider } = Layout;

const SideNavMenuBase: React.FC<{ id?: string, items: any[] }> = ({ id, items }) => {
    const modeCompute = useAppSelector(responsiveComputeSelector)
    const props = modeCompute<SiderProps>({
        'mobile': {
            collapsible: true,
            collapsedWidth: 0,
            width: 100,
        },
        'tablet': {
            width: 120,
        },
        'desktop': {
            width: 200,
        },
    })
    const [collapsed, setCollapsed] = useState(props?.collapsible || false)

    return (<Affix>
        <Sider
            {...props}
            onCollapse={(collapsed) => {
                setCollapsed(collapsed)
            }}
            collapsed={props?.collapsible ? collapsed : false}
            className="site-layout-background">
            <Menu
                mode="inline"
                style={{
                    height: '100%',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    maxHeight: '80vh',
                }}
                items={items}
                selectedKeys={id ? [id] : []}
                onClick={() => {
                    if (props?.collapsible) {
                        setCollapsed(true)
                    }
                }}
            />
        </Sider>
    </Affix>)
}

export const TvLibrarySideNavMenu: React.FC = () => {
    const { library_id } = useParams()
    const { data = [] } = hamsterySlice.useGetTvLibrariesQuery({})
    const items = data.map((lib) => {
        return {
            key: String(lib.id),
            label: <Link to={`/tvshows/${lib.id}?page=1`}>{lib.name}</Link>
        }
    })

    return (<SideNavMenuBase items={items} id={library_id as string} />)
}

export const TvShowSideNavMenu: React.FC = () => {
    const { library_id, show_id } = useParams()
    const { data: show } = hamsterySlice.useGetTvShowQuery(show_id as string)
    let items: any[] = []
    if (show) {
        items = [{
            key: String(show.id),
            label: <Tooltip title={show.name} placement="right">
                <Link to={`/tvshows/${library_id}/${show.id}`}>
                    {show.name}
                </Link>
            </Tooltip>
        }]
    }

    return (<SideNavMenuBase items={items} id={show_id as string} />)
}

export const TvSeasonSideNavMenu: React.FC = () => {
    const { library_id, show_id, season_id } = useParams()
    const location = useLocation()
    const { data: seasons = [] } = hamsterySlice.useGetTvSeasonsQuery({ show: show_id })
    const isSub = location.pathname.endsWith('subscription')
    const items = seasons
        .slice()
        .sort((a, b) => (a.season_number - b.season_number))
        .map((season) => {
            const title = `${season.name} - ${season.number_of_episodes} episodes (${season.air_date})`
            return {
                key: String(season.id),
                label: <Tooltip title={title} placement="right">
                    <Link to={isSub
                        ? `/tvshows/${library_id}/${show_id}/${season.id}/subscription`
                        : `/tvshows/${library_id}/${show_id}/${season.id}`}>
                        {title}
                    </Link>
                </Tooltip>
            }
        })

    return (<SideNavMenuBase items={items} id={season_id as string} />)
}

export const IndexerSideNavMenu: React.FC = () => {
    const locaiton = useLocation()
    const selected = locaiton.pathname.split('/')[2]
    const items = [{
        key: 'torznab',
        label: <Link to={`/indexers/torznab`}>Torznab</Link>
    }]

    return (<SideNavMenuBase items={items} id={selected} />)
}