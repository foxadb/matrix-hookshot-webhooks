const version = 'v2';

if (data === undefined) {
    result = { empty: true, version };
    return;
}

let html, plain;

try {
    const user = data.user_name ?? data.user.name;
    const username = data.user_username ?? data.user.username;
    const projectName = data.project.name;
    const projectUrl = data.project.web_url;
    const mergeRequest = data.merge_request;
    const ref = typeof data.ref === 'string' ? data.ref.split('/')[2] : undefined;

    if (data.object_kind === 'merge_request') {
        const { action, title, url, iid } = data.object_attributes;
        const mergeRequestId = `${projectName}!${iid}`;
        plain = `${user} (${username}) ${action} MR [${mergeRequestId}](${url}): "${title}"`;
    } else if (data.object_kind === 'note') {
        const note = data.object_attributes.note;
        const url = data.object_attributes.url;
        if (mergeRequest) {
            const mergeRequestId = `${projectName}!${mergeRequest.iid}`;
            html = `${user} (${username}) commented MR <a href="${url}">${mergeRequestId}</a>: "${mergeRequest.title}"`;
            plain = `${user} (${username}) commented MR [${mergeRequestId}](${url}): "${mergeRequest.title}"`;
        } else {
            html = `${user} (${username}) <a href="${url}">commented</a> in <a href="${projectUrl}">${projectName}</a>`;
            plain = `${user} (${username}) [commented](${url}) in [${projectName}](${projectUrl})`;
        }
        html += `\n<blockquote>\n${note}\n</blockquote>`;
    } else if (data.object_kind === 'push') {
        const lastCommit = data.commits[data.commits.length - 1];
        const { id, title, url } = lastCommit;
        const shortId = id.slice(0, 8);
        plain = `${user} (${username}) pushed to branch [${ref}](${url}) of [${projectName}](${projectUrl})`;
        plain += `\n> [${shortId}](${url}): ${title}`;
    } else if (data.object_kind === 'tag_push') {
        let action = 'deleted tag';
        let url = `${projectUrl}/-/tags`;
        if (typeof data.checkout_sha === 'string') {
            action = 'pushed tag';
            url += `/${ref}`;
        }
        plain = `${user} (${username}) ${action} [${ref}](${url}) to [${projectName}](${projectUrl})`;
    }
} catch (error) {
    plain = 'Webhook received but failed to process via transformation function\n\n';
    plain += String(error?.stack ?? error) + '\n\n';
    plain += '```json\n' + JSON.stringify(data, null, 2) + '\n```';
}

result = {
    msgtype: 'm.text',
    html,
    plain,
    version,
};
