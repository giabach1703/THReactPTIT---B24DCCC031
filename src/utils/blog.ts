import type { BlogPost } from '@/services/Blog/typing';

export const formatDateTime = (value?: string) => {
	if (!value) return '';
	const date = new Date(value);
	return date.toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

export const generateSlug = (value: string) => {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
};

export const getPlainText = (markdown: string) => {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
		.replace(/\[(.*?)\]\((.*?)\)/g, '$1')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/[*_>~-]/g, ' ')
		.replace(/\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};

export const getExcerpt = (content: string, limit = 140) => {
	const text = getPlainText(content);
	if (text.length <= limit) return text;
	return `${text.slice(0, limit).trim()}...`;
};

export const countPostsByTag = (posts: BlogPost[], tagName: string, onlyPublished = false) => {
	return posts.filter((post) => {
		const matchTag = post.tags.includes(tagName);
		if (!matchTag) return false;
		if (onlyPublished) return post.status === 'published';
		return true;
	}).length;
};

export const getRelatedPosts = (currentPost: BlogPost, allPosts: BlogPost[], limit = 3) => {
	return allPosts
		.filter(
			(item) =>
				item.id !== currentPost.id &&
				item.status === 'published' &&
				item.tags.some((tag) => currentPost.tags.includes(tag)),
		)
		.sort((a, b) => b.viewCount - a.viewCount)
		.slice(0, limit);
};

export const renderMarkdownToHtml = (markdown: string) => {
	if (!markdown) return '';

	let html = markdown;

	html = html.replace(/&/g, '&amp;');
	html = html.replace(/</g, '&lt;');
	html = html.replace(/>/g, '&gt;');

	html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
	html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
	html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
	html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
	html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
	html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
	html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

	html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
	html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
	html = html.replace(/_(.*?)_/g, '<em>$1</em>');
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

	html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width:100%;border-radius:8px;" />');
	html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

	const lines = html.split('\n');
	const output: string[] = [];
	let inList = false;

	lines.forEach((line) => {
		const trimmed = line.trim();

		if (!trimmed) {
			if (inList) {
				output.push('</ul>');
				inList = false;
			}
			return;
		}

		if (/^<h[1-6]>/.test(trimmed) || /^<pre>/.test(trimmed)) {
			if (inList) {
				output.push('</ul>');
				inList = false;
			}
			output.push(trimmed);
			return;
		}

		if (/^- /.test(trimmed)) {
			if (!inList) {
				output.push('<ul>');
				inList = true;
			}
			output.push(`<li>${trimmed.replace(/^- /, '')}</li>`);
			return;
		}

		if (inList) {
			output.push('</ul>');
			inList = false;
		}

		output.push(`<p>${trimmed}</p>`);
	});

	if (inList) {
		output.push('</ul>');
	}

	return output.join('');
};
