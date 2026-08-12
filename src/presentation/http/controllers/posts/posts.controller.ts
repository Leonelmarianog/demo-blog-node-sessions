import { Controller, Get, Render } from '@nestjs/common';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string;
  status: 'draft' | 'published';
}

interface PostEditorViewModel {
  appTitle: string;
  year: number;
  pageTitle: string;
  submitLabel: string;
  post: PostFormData;
}

@Controller('posts')
export class PostsController {
  @Get('new')
  @Render('pages/post-editor')
  new(): PostEditorViewModel {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      pageTitle: 'New post',
      submitLabel: 'Publish',
      post: {
        title: '',
        slug: '',
        excerpt: '',
        body: '',
        tags: '',
        status: 'draft',
      },
    };
  }

  @Get(':slug/edit')
  @Render('pages/post-editor')
  edit(): PostEditorViewModel {
    return {
      appTitle: 'Demo Blog',
      year: new Date().getFullYear(),
      pageTitle: 'Edit post',
      submitLabel: 'Save changes',
      post: {
        title: 'Building a server-rendered blog with NestJS and Handlebars',
        slug: 'building-a-server-rendered-blog',
        excerpt:
          'Why server-rendering still makes sense for a content-heavy blog, and how NestJS plus Handlebars keep the stack simple without giving up on a clean, layered architecture.',
        body: [
          'Most of the web is read, not written. For a content-heavy site like a blog, sending fully-formed HTML from the server is hard to beat: it is fast on first paint, works without JavaScript, and indexes cleanly.',
          '',
          '## Why server-rendering still earns its place',
          '',
          'Single-page apps shine for application-like interfaces, but a blog is mostly pages. Shipping rendered HTML means the browser can paint content immediately, and readers on slow connections or with JavaScript disabled still get the article.',
          '',
          '## Handlebars over the alternatives',
          '',
          'Handlebars auto-escapes by default, which is safer than EJS, and it has first-class layout support that keeps a shared shell out of every page.',
          '',
          '## Keeping the architecture honest',
          '',
          'Rendering HTML does not mean abandoning layering. Controllers stay thin, application actions carry the use cases, and the domain stays free of framework concerns.',
        ].join('\n'),
        tags: 'nestjs, handlebars, architecture',
        status: 'published',
      },
    };
  }

  @Get(':slug')
  @Render('pages/post-detail')
  detail(): { appTitle: string; year: number } {
    return { appTitle: 'Demo Blog', year: new Date().getFullYear() };
  }
}
