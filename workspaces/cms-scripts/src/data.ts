import * as path from "node:path";
import { locales } from "@starknet-io/cms-data/src/i18n/config";
import { scandir, yaml } from "./utils";
import { DefaultLogFields } from "simple-git";
import { gitlog } from "./git";
import { getUnixTime, isValid, parseISO } from "date-fns";
import { slugify } from "@starknet-io/cms-utils/src/index";
import { translateFile } from "./crowdin";

export interface Meta {
  readonly gitlog?: DefaultLogFields | undefined | null;
  readonly sourceFilepath: string;
  readonly locale: string;
  readonly objectID: string;
}

export interface Post extends Meta {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly image: string;
  readonly category: string;
  readonly topic: string[];
  readonly short_desc: string;
  readonly post_type: string;
  readonly post_date: string;
  readonly time_to_consume: string;
  readonly published_date: string;
  readonly toc: boolean;
  readonly video: any;
  blocks: readonly any[];
}

export async function fileToPost(
  locale: string,
  filename: string
): Promise<Post> {
  const resourceName = "posts";

  const sourceFilepath = path.join("_data", resourceName, filename);
  const sourceData = await yaml(sourceFilepath);

  const data = await translateFile(locale, resourceName, filename);

  const slug = slugify(sourceData.title);

  return {
    id: data.id,
    slug,
    title: data.title,
    category: data.category,
    post_type: data.post_type,
    post_date: data.post_date,
    published_date: data.published_date,
    time_to_consume: data.time_to_consume,
    toc: data.toc,
    video: data.video,
    topic: data.topic ?? [],
    short_desc: data.short_desc,
    image: data.image,
    blocks: data.blocks ?? [],
    locale,
    objectID: `${resourceName}:${locale}:${filename}`,
    sourceFilepath,
    gitlog: await gitlog(sourceFilepath),
  };
}

export interface Page extends Meta {
  readonly id: string;
  readonly slug: string;
  readonly parent_page?: string | undefined;
  readonly title: string;
  readonly template: "landing" | "content";
  readonly breadcrumbs: boolean;
  readonly pageLastUpdated: boolean;
  blocks?: any;

  link?: string;
  breadcrumbs_data?: Page[];
}

export async function fileToPage(
  locale: string,
  filename: string
): Promise<Page> {
  const resourceName = "pages";

  const sourceFilepath = path.join("_data", resourceName, filename);
  const sourceData = await yaml(sourceFilepath);

  const data = await translateFile(locale, resourceName, filename);

  const slug = slugify(sourceData.title);

  return {
    ...data,
    blocks: data.blocks ?? [],
    id: data.id,
    parent_page: data.parent_page,
    slug,
    locale,
    objectID: `${resourceName}:${locale}:${filename}`,
    sourceFilepath,
    gitlog: await gitlog(sourceFilepath),
  };
}

interface PagesData extends SimpleData<Page> {
  readonly idMap: Map<string, Page>;
}

export async function getPages(): Promise<PagesData> {
  const resourceName = "pages";
  const filenameMap = new Map<string, Page>();
  const idMap = new Map<string, Page>();

  const filenames = await scandir(`_data/${resourceName}`);

  for (const locale of locales) {
    for (const filename of filenames) {
      const data = await fileToPage(locale, filename);

      idMap.set(`${locale}:${data.id}`, data);
      filenameMap.set(`${locale}:${filename}`, data);
    }
  }

  for (const locale of locales) {
    for (const filename of filenames) {
      const data = filenameMap.get(`${locale}:${filename}`)!;

      const breadcrumbs = [];
      let currentPage = data;
      while (currentPage.parent_page != null) {
        if (currentPage.parent_page == null) break;
        if (currentPage.parent_page === "") break;

        const key = `${locale}:${currentPage.parent_page}`;

        if (!idMap.has(key)) {
          console.log(currentPage.parent_page);
          console.log("currentPage.parent_page not found!");
          console.log(currentPage);

          break;
        }

        currentPage = idMap.get(key)!;
        breadcrumbs.unshift(currentPage);
      }

      data.link = [
        "",
        locale,
        ...breadcrumbs.map((page) => page.slug),
        data.slug,
      ].join("/");

      data.breadcrumbs_data = breadcrumbs;
    }

    for (const filename of filenames) {
      const data = filenameMap.get(`${locale}:${filename}`)!;

      data.breadcrumbs_data = data.breadcrumbs_data?.map((page) => {
        return {
          ...page,
          blocks: undefined,
          gitlog: undefined,
          breadcrumbs_data: undefined,
        };
      });
    }
  }

  return { filenameMap, idMap, filenames, resourceName };
}

interface PostsData extends SimpleData<Post> {
  readonly idMap: Map<string, Post>;
}

export async function getPosts(): Promise<PostsData> {
  const resourceName = "posts";
  const filenameMap = new Map<string, Post>();
  const idMap = new Map<string, Post>();
  const filenames = await scandir(`_data/${resourceName}`);

  for (const locale of locales) {
    for (const filename of filenames) {
      const data = await fileToPost(locale, filename);

      idMap.set(`${locale}:${data.id}`, data);
      filenameMap.set(`${locale}:${filename}`, data);
    }
  }

  return { filenameMap, filenames, idMap, resourceName };
}

export async function getTutorials(): Promise<SimpleData<Meta>> {
  const resourceData = await getSimpleData("tutorials");

  resourceData.filenameMap.forEach((data: any) => {
    if (typeof data.tags === "string") {
      data.tags = data.tags.replace(/,\s*$/, "").split(",").map((t: string) => t.trim());
    }
  });

  return resourceData;
}

interface SimpleData<T> {
  readonly filenameMap: Map<string, T>;
  readonly filenames: string[];
  readonly resourceName: string;
}

export async function getSimpleData<T = {}>(
  resourceName: string
): Promise<SimpleData<T & Meta>> {
  const filenameMap = new Map<string, T & Meta>();
  const filenames = await scandir(`_data/${resourceName}`);

  for (const locale of locales) {
    for (const filename of filenames) {
      const sourceFilepath = path.join("_data", resourceName, filename);
      const sourceData = await yaml(sourceFilepath);
      const data = await translateFile(locale, resourceName, filename);

      const defaultLocaleTitle = sourceData.title ?? sourceData.name;

      const slug = defaultLocaleTitle ? slugify(defaultLocaleTitle) : undefined;

      const dates: { [key: string]: number } = {};

      for (const key in data) {
        if (/(^|_)(at|date)$/.test(key)) {
          const date = parseISO(data[key]);

          if (isValid(date)) {
            dates[`${key}_ts`] = getUnixTime(date);
          }
        }
      }

      filenameMap.set(`${locale}:${filename}`, {
        ...data,
        ...dates,
        slug,
        locale: locale,
        objectID: `${resourceName}:${locale}:${filename}`,
        sourceFilepath,
      });
    }
  }

  return { filenameMap, filenames, resourceName };
}

export interface ItemsFile<T = {}> {
  readonly items: readonly T[];
}

interface SimpleFiles<T> {
  readonly localeMap: Map<string, T>;
  readonly resourceName: string;
}

export async function getSimpleFiles<T = ItemsFile>(
  resourceName: string
): Promise<SimpleFiles<T & Meta>> {
  const collectionName = "settings";
  const filename = `${resourceName}.yml`;

  const localeMap = new Map<string, T & Meta>();

  for (const locale of locales) {
    const sourceFilepath = path.join("_data", collectionName, filename);

    const data = await translateFile(locale, collectionName, filename);

    localeMap.set(locale, {
      ...data,
      locale: locale,
      objectID: `${resourceName}:${locale}`,
      sourceFilepath,
    });
  }

  return { localeMap, resourceName };
}

export function updateBlocks(pages: PagesData, posts: PostsData) {
  const resources = [pages, posts] as const;

  function handleBlocks(locale: string, blocks: any) {
    const newBlocks = blocks.map((block: any) => {
      const newBlock = { ...block };

      if (block.blocks) {
        newBlock.blocks = handleBlocks(locale, block.blocks);
      }

      if (block.link) {
        newBlock.link = handleLink(locale, block.link, pages, posts);
      }

      return newBlock;
    });

    return newBlocks;
  }

  for (const { filenameMap } of resources) {
    for (const [, data] of filenameMap) {
      data.blocks = handleBlocks(data.locale, data.blocks);
    }
  }
}

export function handleLink(
  locale: string,
  link: any,
  pages: PagesData,
  posts: PostsData
): any {
  const newLink = { ...link };

  if (link.page != null) {
    const key = `${locale}:${link.page}`;
    if (pages.idMap.has(key)) {
      const data = pages.idMap.get(key)!;

      newLink.page_data = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        template: data.template,
        breadcrumbs: data.breadcrumbs,
        pageLastUpdated: data.pageLastUpdated,
        link: data.link,
      };
    }
  }

  if (link.post != null) {
    const key = `${locale}:${link.post}`;
    if (posts.idMap.has(key)) {
      const data = posts.idMap.get(key)!;

      newLink.post_data = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        image: data.image,
        category: data.category,
        topic: data.topic,
        short_desc: data.short_desc,
        locale: data.locale,
        sourceFilepath: data.sourceFilepath,
      };
    }
  }

  return newLink;
}
