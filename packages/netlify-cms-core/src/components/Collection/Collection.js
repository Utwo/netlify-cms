import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { translate } from 'react-polyglot';
import { lengths } from 'netlify-cms-ui-default';
import { getNewEntryUrl } from 'Lib/urlHelper';
import Sidebar from './Sidebar';
import CollectionTop from './CollectionTop';
import EntriesCollection from './Entries/EntriesCollection';
import EntriesSearch from './Entries/EntriesSearch';
import CollectionControls from './CollectionControls';
import { sortByField } from 'Actions/entries';
import { selectSortableFields } from 'Reducers/collections';
import { selectEntriesSort } from 'Reducers/entries';
import { VIEW_STYLE_LIST } from 'Constants/collectionViews';
import { getFilterPath } from '../../routing/helpers';

const CollectionContainer = styled.div`
  margin: ${lengths.pageMargin};
`;

const CollectionMain = styled.main`
  padding-left: 280px;
`;

class Collection extends React.Component {
  static propTypes = {
    searchTerm: PropTypes.string,
    collectionName: PropTypes.string,
    isSearchResults: PropTypes.bool,
    collection: ImmutablePropTypes.map.isRequired,
    collections: ImmutablePropTypes.orderedMap.isRequired,
    sortableFields: PropTypes.array,
    sort: ImmutablePropTypes.orderedMap,
    onSortClick: PropTypes.func.isRequired,
  };

  state = {
    viewStyle: VIEW_STYLE_LIST,
  };

  renderEntriesCollection = () => {
    const { collection, filterTerm } = this.props;
    return (
      <EntriesCollection
        collection={collection}
        viewStyle={this.state.viewStyle}
        filterTerm={filterTerm}
      />
    );
  };

  renderEntriesSearch = () => {
    const { searchTerm, collections } = this.props;
    return <EntriesSearch collections={collections} searchTerm={searchTerm} />;
  };

  handleChangeViewStyle = viewStyle => {
    if (this.state.viewStyle !== viewStyle) {
      this.setState({ viewStyle });
    }
  };

  render() {
    const {
      collection,
      collections,
      collectionName,
      isSearchResults,
      searchTerm,
      sortableFields,
      onSortClick,
      sort,
      filterTerm,
    } = this.props;
    let newEntryUrl = '';
    if (collection.get('create')) {
      newEntryUrl = getNewEntryUrl(collectionName);
      const path = getFilterPath(filterTerm);
      if (path) {
        newEntryUrl = `${newEntryUrl}?path=${path}`;
      }
    }

    return (
      <CollectionContainer>
        <Sidebar collections={collections} searchTerm={searchTerm} filterTerm={filterTerm} />
        <CollectionMain>
          {isSearchResults ? null : (
            <>
              <CollectionTop collection={collection} newEntryUrl={newEntryUrl} />
              <CollectionControls
                collection={collection}
                viewStyle={this.state.viewStyle}
                onChangeViewStyle={this.handleChangeViewStyle}
                sortableFields={sortableFields}
                onSortClick={onSortClick}
                sort={sort}
              />
            </>
          )}
          {isSearchResults ? this.renderEntriesSearch() : this.renderEntriesCollection()}
        </CollectionMain>
      </CollectionContainer>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { collections } = state;
  const { isSearchResults, match, t } = ownProps;
  const { name, searchTerm } = match.params;
  let filterTerm = undefined;
  if ('filterTerm' in match.params) {
    // handle root filterTerm (e.g. /filter/)
    filterTerm = match.params.filterTerm || '';
  }
  const collection = name ? collections.get(name) : collections.first();
  const sort = selectEntriesSort(state.entries, collection.get('name'));
  const sortableFields = selectSortableFields(collection, t);

  return {
    collection,
    collections,
    collectionName: name,
    isSearchResults,
    searchTerm,
    filterTerm,
    sort,
    sortableFields,
  };
}

const mapDispatchToProps = {
  sortByField,
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    ...ownProps,
    onSortClick: (key, direction) =>
      dispatchProps.sortByField(stateProps.collection, key, direction),
  };
};

const ConnectedCollection = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Collection);

export default translate()(ConnectedCollection);
