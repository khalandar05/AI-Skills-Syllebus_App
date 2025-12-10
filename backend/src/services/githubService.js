// Service to handle GitHub API interactions
// TODO: Replace placeholders with real API calls using Octokit

const { Octokit } = require("@octokit/rest");

class GithubService {
    async fetchUserRepos(accessToken) {
        if (!accessToken) throw new Error("No access token provided");

        const octokit = new Octokit({ auth: accessToken });
        const { data } = await octokit.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 10
        });

        return data.map(repo => ({
            id: repo.id,
            name: repo.name,
            html_url: repo.html_url,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count
        }));
    }

    async getRepoStats(owner, repo, accessToken) {
        if (!accessToken) throw new Error("No access token provided");

        const octokit = new Octokit({ auth: accessToken });
        const { data } = await octokit.repos.get({ owner, repo });

        // Get commits (simplified count)
        const commits = await octokit.repos.listCommits({ owner, repo, per_page: 1 });
        // Header contains link info for pagination, but for rough stats we can use simple fetch or approximate

        return {
            commits: 0, // Todo: accurate count needs pagination traversal or GraphQL
            lastUpdate: data.updated_at,
            contributors: 0, // Todo
            stars: data.stargazers_count,
            openIssues: data.open_issues_count
        };
    }
}

module.exports = new GithubService();
