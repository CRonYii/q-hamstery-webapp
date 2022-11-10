import { TagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import { IDjangoOptions, IParamOptions, ITorznabIndexer, ITvEpisode, ITvLibrary, ITvSeason, ITvShow, ITvStorage } from '../../app/entities';

type TagTypes = 'tvlib' | 'tvstorage' | 'torznab'

export const hamsterySlice = createApi({
    reducerPath: 'hamstery',
    baseQuery: fetchBaseQuery({
        baseUrl: '/hamstery/api', prepareHeaders: (headers) => {
            const token = Cookies.get('csrftoken')
            if (token)
                headers.set('X-CSRFToken', token)
            return headers
        }
    }),
    tagTypes: ['tvlib', 'tvstorage', 'torznab'],
    endpoints: builder => {
        const CRUDEntity = <T extends { id: number }>(name: TagTypes, url: string) => {
            // TODO: extra tags option
            return {
                getAll: builder.query<T[], any>({
                    query: (params) => ({
                        method: 'GET',
                        url,
                        params
                    }),
                    providesTags: (result = [], error, arg) => [
                        name,
                        ...result.map(({ id }): TagDescription<TagTypes> => ({ type: name, id: String(id) }))
                    ]
                }),
                get: builder.query<T, string>({
                    query: (id) => `${url}${id}/`,
                    providesTags: (result, error, arg) => [{ type: name, id: arg }]
                }),
                create: builder.mutation<void, T | FormData>({
                    query: (body) => ({
                        method: 'POST',
                        url,
                        body
                    }),
                    invalidatesTags: [name]
                }),
                delete: builder.mutation<void, string>({
                    query: (id) => ({
                        method: 'DELETE',
                        url: `${url}${id}/`,
                    }),
                    invalidatesTags: [name]
                }),
                update: builder.mutation<void, { id: string, body: T | FormData }>({
                    query: ({ id, body }) => {
                        return {
                            method: 'PUT',
                            url: `${url}${id}/`,
                            body
                        }
                    },
                    invalidatesTags: (result, error, arg) => [{ type: name, id: arg.id }]
                }),
                options: builder.query<IParamOptions | undefined, void>({
                    query: () => ({
                        method: 'OPTIONS',
                        url: url,
                        headers: {
                            'Accept': 'application/json'
                        }
                    }),
                    transformResponse: (response: IDjangoOptions) => {
                        return response.actions.POST
                    }
                }),
            }
        }
        const tvlib = CRUDEntity<ITvLibrary>('tvlib', '/tvlib/')
        const tvstorage = CRUDEntity<ITvStorage>('tvstorage', '/tvstorage/')
        const torznab = CRUDEntity<ITorznabIndexer>('torznab', '/torznab/')
        return {
            getTvLibraries: tvlib.getAll,
            getTvLibrary: tvlib.get,
            addTvLibrary: tvlib.create,
            removeTvLibrary: tvlib.delete,
            editTvLibrary: tvlib.update,
            getTvLibraryOptions: tvlib.options,
            getTvStorages: tvstorage.getAll,
            getTvStorage: tvstorage.get,
            addTvStorage: tvstorage.create,
            removeTvStorage: tvstorage.delete,
            editTvStorage: tvstorage.update,
            getTvStorageOptions: tvstorage.options,
            getTvShow: builder.query<ITvShow & { seasons: ITvSeason[] }, string>({
                query: (id) => `/tvshow/${id}/`,
            }),
            addTvShowToStorage: builder.mutation<void, { library_id: string, id: string, tmdb_id: string, }>({
                query: ({ id, tmdb_id }) => ({
                    method: 'POST',
                    url: `/tvstorage/${id}/add-show/`,
                    headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    body: `tmdb_id=${tmdb_id}`
                }),
                invalidatesTags: (result, error, arg) => [{ type: 'tvlib', id: arg.library_id }]
            }),
            getTvSeason: builder.query<ITvSeason, string>({
                query: (id) => `/tvseason/${id}/`,
            }),
            getTvEpisode: builder.query<ITvEpisode, string>({
                query: (id) => `/tvepisode/${id}/`,
            }),
            getTorznabIndexers: torznab.getAll,
            getTorznabIndexer: torznab.get,
            addTorznabIndexer: torznab.create,
            removeTorznabIndexer: torznab.delete,
            editTorznabIndexer: torznab.update,
            getTorznabIndexerOptions: torznab.options,
        }
    }
})