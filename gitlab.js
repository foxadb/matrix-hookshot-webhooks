const version = 'v2';

if (data === undefined) {
    result = { empty: true, version };
    return;
}

const user = data.user_name ?? data.user.name;
const username = data.user_username ?? data.user.username;
const projectName = data.project.name;
const projectUrl = data.project.web_url;
const mergeRequest = data.merge_request;
const ref = typeof data.ref === 'string' ? data.ref.split('/')[2] : undefined;

let plain = '';

if (data.object_kind === 'merge_request') {
    const { action, title, url } = data.object_attributes;
    plain = `${user} (${username}) ${action} [${title}](${url}) in [${projectName}](${projectUrl})`;
} else if (data.object_kind === 'note') {
    const note = data.object_attributes.note;
    const url = data.object_attributes.url;
    plain = `${user} (${username}) [commented](${url}) in [${projectName}](${projectUrl})`;
    if (mergeRequest) {
        plain += `: ${mergeRequest.title}`;
    }    
    plain += `\n> ${note}`;
} else if (data.object_kind === 'push') {
    const lastCommit = data.commits[data.commits.length - 1];
    const { id, title, url } = lastCommit;
    const shortId = id.slice(0, 8);
    plain = `${user} (${username}) pushed to branch [${ref}](${url}) of [${projectName}](${projectUrl})`;
    plain += `\n> [${shortId}](${url}): ${title}`;
} else if (data.object_kind === 'tag_push') {
    const action = data.checkout_sha ? 'pushed new tag' : 'deleted tag';
    plain = `${user} (${username}) ${action} [${ref}](${url}) to [${projectName}](${projectUrl})`;
}

result = {
    msgtype: 'm.notice',
    plain,
    webhookResponse: {
        contentType: 'application/json',
        statusCode: 204
    },
    version,
};
