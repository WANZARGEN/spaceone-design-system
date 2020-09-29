import { Ref, ref } from '@vue/composition-api';

import {
    HelperToolSet,
    initReactive, StateToolSet, SyncStateToolSet,
} from '@/util/toolset-helpers';
import {
    GridLayoutState,
    GridLayoutStateType, GridLayoutSyncStateType,
} from '@/molecules/layouts/grid-layout/PGridLayout.toolset';
import { getAllPage } from '@/organisms/pagination/PTextPagination.toolset';

export interface ToolBoxGridLayoutStateType extends GridLayoutStateType{
    paginationVisible: boolean;
    pageSizeVisible: boolean;
    refreshVisible: boolean;
    allPage: number;
    pageNationValues: number[];
}
export interface ToolBoxGridLayoutSyncStateType extends GridLayoutSyncStateType{
    pageSize: number;
    thisPage: number;
}

@StateToolSet<ToolBoxGridLayoutStateType>()
@SyncStateToolSet<ToolBoxGridLayoutSyncStateType>()
export class ToolboxGridLayoutState<
    initData=any,
    initSyncData=any,
    initState extends ToolBoxGridLayoutStateType=ToolBoxGridLayoutStateType,
    initSyncState extends ToolBoxGridLayoutSyncStateType=ToolBoxGridLayoutSyncStateType,
    > extends GridLayoutState<initData, initSyncData, initState, initSyncState> {
    static initState() {
        return {
            ...GridLayoutState.initState(),
            paginationVisible: true,
            pageSizeVisible: true,
            refreshVisible: true,
            allPage: 1,
            pageNationValues: [24, 36, 48],

        };
    }

    static initSyncState() {
        return {
            ...GridLayoutState.initSyncState(),
            pageSize: 24,
            thisPage: 1,
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {}as initSyncData, lazy = false) {
        super(initData, initSyncData, true);
        this.state = initReactive(lazy, ToolboxGridLayoutState.initState(), initData);
        this.syncState = initReactive(lazy, ToolboxGridLayoutState.initSyncState(), initSyncData);
    }
}

@HelperToolSet()
export class ToolboxGridLayoutToolSet<initData=any, initSyncData=any> extends ToolboxGridLayoutState<initData, initSyncData> {
    setAllPage: (totalCount: number) => void = null as unknown as (totalCount: number) => void;

    static initToolSet(_this: any, ...args: any[]) {
        _this.setAllPage = (totalCount: number) => {
            _this.state.allPage = getAllPage(totalCount, (_this.syncState.pageSize));
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, initSyncData);
        if (!lazy) {
            ToolboxGridLayoutToolSet.initToolSet(this);
        }
    }
}


@HelperToolSet()
export class SearchGridLayoutToolSet<initData=any, initSyncData=any> extends ToolboxGridLayoutToolSet<initData, initSyncData> {
    searchText: Ref<string> = null as unknown as Ref<string>;

    static initToolSet(_this: any) {
        ToolboxGridLayoutToolSet.initToolSet(_this);
        _this.searchText = ref('');
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, initSyncData, true);
        if (!lazy) {
            SearchGridLayoutToolSet.initToolSet(this);
        }
    }
}

