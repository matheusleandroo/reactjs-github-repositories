import React, { Component } from 'react';
import { FaArrowAltCircleLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  StateButtons,
  PaginationButtons,
} from './styles';

export default class Repository extends Component {
  state = {
    repoName: '',
    stateIssue: '',
    page: 1,
    repository: {},
    issues: [],
    loading: true,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repoName,
      stateIssue: 'open',
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  GetIssues = async (e, action, page) => {
    e.preventDefault();

    const { repoName } = this.state;

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: action,
        per_page: 5,
        page,
      },
    });

    this.setState({
      issues: issues.data,
      stateIssue: action,
    });
  };

  PrevPage = async (e, stateIssue) => {
    e.preventDefault();

    const { page } = this.state;

    if (page === 1) return;

    const pageNumber = page - 1;

    this.setState({
      page: pageNumber,
    });

    this.GetIssues(e, stateIssue, pageNumber);
  };

  NextPage = async (e, stateIssue) => {
    e.preventDefault();

    const { page, issues } = this.state;

    if (page === issues.pages) return;

    const pageNumber = page + 1;

    this.setState({
      page: pageNumber,
    });

    this.GetIssues(e, stateIssue, pageNumber);
  };

  render() {
    const { repoName, stateIssue, repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Loading...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">
            <FaArrowAltCircleLeft />
          </Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repoName}</h1>
          <p>{repository.description}</p>
        </Owner>

        <StateButtons>
          <button type="button" onClick={e => this.GetIssues(e, 'all')}>
            All
          </button>
          <button type="button" onClick={e => this.GetIssues(e, 'open')}>
            Open
          </button>
          <button type="button" onClick={e => this.GetIssues(e, 'closed')}>
            Closed
          </button>
        </StateButtons>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <PaginationButtons>
          <button type="button" onClick={e => this.PrevPage(e, stateIssue)}>
            Prev
          </button>
          <button type="button" onClick={e => this.NextPage(e, stateIssue)}>
            Next
          </button>
        </PaginationButtons>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
