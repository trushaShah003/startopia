import { formatDate } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { PLAYLIST_BY_SLUG_QUERY, STARTUP_BY_ID } from '@/sanity/lib/queries';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import React from 'react'
import markdownit from 'markdown-it';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import View from '@/components/View';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';


const md = markdownit({
    html: true,
    typographer: true,
});

// Normalize markdown input before rendering
// const normalizeMarkdown = (input: string) => {
//     return input
//       .split('\n')
//       .map(line => {
//         // Convert list items with spaces before "*" or "-" to proper format
//         const trimmed = line.trimStart();
//         if (/^[*-]\s+/.test(trimmed)) return trimmed;
//         if (/^[*|-]\w/.test(trimmed)) return trimmed.replace(/^([*-])/, '$1 ');
//         return trimmed;
//       })
//       .join('\n');
//   };

export const experimental_ppr = true;

const page = async ({params}:{params : Promise<{id:string}>}) => {
    const id = (await params).id;

    const [post, { select: editotPosts} ] = await Promise.all([
        client.fetch(STARTUP_BY_ID, { id }),
        client.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: 'editor-picks'})
    ])

    // const post = await client.fetch(STARTUP_BY_ID, { id });

    if(!post) return notFound();
    
    // const { select: editotPosts} = await client.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: 'editor-picks'})
    
    // const cleanedMarkdown = normalizeMarkdown(post?.pitch || '');
    // console.log('cleanedMarkdown',cleanedMarkdown)
    const parsedContent = md.render(post?.pitch || '');
    // console.log('parsedContent',parsedContent)

  return (
    <>
    <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post?._createdAt)}</p>
    <h1 className="heading">{post.title}</h1>
    <p className="sub-heading !max-w-5xl">{post?.description}</p>
    </section>
    <section className="section_container ">
        <img src={post?.image} alt="placeholder" className='w-full h-auto rounded-xl max-h-[500px] object-cover' />
    
        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
            <div className="flex-between gap-5">
                <Link href={`/user/${post.author?._id}`} className='flex gap-2 items-center mb-3'>
                    <Image src={post.author?.image} alt='placeholder' width={64} height={64} className='rounded-full drop-shadow-lg' />

                    <div>
                        <p className="text-20-medium">{post.author.name}</p>
                        <p className="text-16-medium !text-black-300">@{post.author.username}</p>
                    </div>
                </Link>
                <p className="category-tag">{post.category}</p>
            </div>

            <h3 className="text-30-bold">Pitch Details</h3>

            {parsedContent ? (
                <div className="markdown-content">
                <article className="prose prose-lg max-w-4xl font-work-sans break-all" dangerouslySetInnerHTML={{__html: parsedContent}} />
                </div>
            ): (
                <p className="no-result">No details provided</p>
            )}
        </div>
        <hr className="divider" />

        {/* TODO : EDITOR SELECTED STARTUPS */}
        {editotPosts.length > 0 && (
            <div className="max-w-4xl mx-auto">
                <p className="text-30-semibold">Editor Picks</p>
                <ul className="mt-7 card_grid-sm">
                    {editotPosts.map((post: StartupTypeCard, index: number)=>(
                        <StartupCard key={post._id+index} post={post} />
                    ))}
                </ul>
            </div>
        )}

        <Suspense fallback={<Skeleton className='view_skeleton' />} >
            <View id={id} />
        </Suspense>
    </section>
    </>
  )
}

export default page