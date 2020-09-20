import { KeyDataType, QueryItem } from '@/components/organisms/search/query-search/type';
import { QueryTagConverter, QueryTag, QueryTagValidator } from '@/components/organisms/search/query-search-tags/type';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);


const trueRegex = RegExp('true', 'i');
const falseRegex = RegExp('false', 'i');
const booleanConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const str = String(res.value.name) || '';

    if (trueRegex.test(str)) res.value = { ...res.value, name: false, label: 'TRUE' };
    else if (falseRegex.test(str)) res.value = { ...res.value, name: true, label: 'FALSE' };
    else {
        res.invalid = true;
        res.description = 'This is not suitable for boolean format.';
    }
    return res;
};

const datetimeRegex = RegExp(/^(\d{4}-\d{2}-\d{2})$/);
const datetimeConverter = (query: QueryItem, timezone: string): QueryTag => {
    const res: QueryTag = { ...query };
    if (datetimeRegex.test(query.value.name)) {
        const time = dayjs.utc(query.value.name);
        res.value = {
            label: dayjs.tz(time, timezone).format('YYYY-MM-DD'),
            name: time.format('YYYY-MM-DD'),
        };
    } else {
        res.invalid = true;
        res.description = 'This is not suitable for datetime format. e.g. 2020-05-03';
    }
    return res;
};

const integerConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseInt(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = 'This is not suitable for integer format.';
    } else res.value = { ...res.value, name: number, label: String(number) };
    return res;
};

const floatConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    const number = parseFloat(query.value.name);
    if (Number.isNaN(number)) {
        res.invalid = true;
        res.description = 'This is not suitable for float format.';
    } else res.value = { ...res.value, name: number, label: String(number) };
    return res;
};

const stringConverter = (query: QueryItem): QueryTag => {
    const res: QueryTag = { ...query };
    res.value = { ...res.value, name: String(query.value.name) };
    return res;
};


const converterMap: Record<KeyDataType, QueryTagConverter> = {
    boolean: booleanConverter,
    datetime: datetimeConverter,
    integer: integerConverter,
    float: floatConverter,
    string: stringConverter,
};

const defaultConverter = (query: QueryItem, timezone: string): QueryTag => {
    if (query.key?.dataType) {
        const converter = converterMap[query.key.dataType];
        if (converter) return converter(query, timezone);
        return stringConverter(query);
    }
    return query;
};

const defaultValidator: QueryTagValidator = (query: QueryTag, tags: QueryTag[]): boolean => tags.every((tag) => {
    if (tag.key && query.key) {
        return (query.key.name !== tag.key.name
            || query.operator !== tag.operator
            || query.value.name !== tag.value.name);
    }
    if (!tag.key && !query.key) {
        return query.value.name !== tag.value.name;
    }
    return true;
});

export {
    defaultConverter,
    defaultValidator,
};
