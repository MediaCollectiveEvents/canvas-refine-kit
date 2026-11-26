import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageSection from "@/components/shared/PageSection";
import Seo from "@/components/shared/Seo";
import { getContributors } from "@/lib/contributors";
import type { Contributor } from "@/lib/contentMetadata";
import { Linkedin, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

function Profile({person,featured=false}:{person:Contributor;featured?:boolean}){
 return <article className={featured?"grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-14":"flex flex-col gap-5"}>
 <div className={featured?"aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-sm bg-[#172b31]":"aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-sm bg-[#172b31]"}>
 {person.image?<img src={person.image} alt={person.displayName} className="h-full w-full object-cover" loading="lazy"/>:<div className="flex h-full flex-col items-center justify-center gap-3 text-[#8FC7C1]/60"><UserRound className="h-14 w-14" strokeWidth={1} aria-hidden="true"/><span className="text-xs">Portrait to be added</span></div>}
 </div>
 <div><h3 className={featured?"font-display text-3xl font-light md:text-4xl":"font-display text-2xl font-light"}>{person.displayName}</h3><p className="mt-2 font-body text-base text-[#9bd3c8]">{[person.role,person.organisation].filter(Boolean).join(" · ")}</p>
 {person.biography?<p className="mt-5 max-w-[65ch] whitespace-pre-line font-body text-base leading-[1.8] text-white/75">{person.biography}</p>:<p className="mt-5 text-sm text-white/50">Biography to be added.</p>}
 {person.linkedinUrl&&<a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"><Linkedin size={19} aria-hidden="true"/> LinkedIn profile</a>}</div>
 </article>;
}
export default function Team(){
 const people=getContributors().filter(p=>p.teamGroup).sort((a,b)=>(a.teamOrder??999)-(b.teamOrder??999)||a.displayName.localeCompare(b.displayName,"en-GB"));
 const founders=people.filter(p=>p.teamGroup==="founder"),core=people.filter(p=>p.teamGroup==="core"),collaborators=people.filter(p=>p.teamGroup==="collaborator");
 return <div className="min-h-screen bg-[#101d24] text-[#f7f3eb]"><Seo title="The People Behind The Media Collective — Staging" noindex/><Header/><main id="main-content" tabIndex={-1} className="site-header-clearance">
 <section className="site-gutter border-b border-white/10 bg-[#101d24] py-16 md:py-24"><div className="site-container grid gap-8 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><p className="site-eyebrow mb-5 text-[#8FC7C1]">ABOUT THE MEDIA COLLECTIVE</p><h1 className="font-display text-4xl font-light leading-[1.12] tracking-tight md:text-6xl [text-wrap:balance]">The people behind The Media Collective</h1></div><p className="max-w-[45ch] text-base leading-[1.8] text-white/75 lg:col-span-4">Bringing people together across the media industry through thoughtfully curated events, conversation and collaboration.</p></div></section>
 <PageSection className="border-b border-white/10"><p className="site-eyebrow mb-8 text-[#8FC7C1]">OUR FOUNDER</p><div className="space-y-12">{founders.map(p=><Profile key={p.id} person={p} featured/>)}</div></PageSection>
 <PageSection className="border-b border-white/10"><div className="grid gap-6 lg:grid-cols-12"><div className="lg:col-span-4"><p className="site-eyebrow mb-4 text-[#8FC7C1]">OUR TEAM</p><h2 className="site-heading">Working together</h2></div><div className="lg:col-span-8"><p className="max-w-[65ch] text-base leading-[1.8] text-white/75">Our work draws on experience across membership organisations, sales, marketing, PR, media technology and strategy.</p>{core.length?<div className="mt-8 grid gap-10 sm:grid-cols-2">{core.map(p=><Profile key={p.id} person={p}/>)}</div>:<p className="mt-6 text-sm text-white/50">Additional approved team profiles will appear here.</p>}</div></div></PageSection>
 <PageSection className="border-b border-white/10"><div className="grid gap-6 lg:grid-cols-12"><div className="lg:col-span-4"><p className="site-eyebrow mb-4 text-[#8FC7C1]">OUR WIDER NETWORK</p><h2 className="site-heading">Collaborators</h2></div><div className="lg:col-span-8"><p className="max-w-[65ch] text-base leading-[1.8] text-white/75">The Media Collective works with people and organisations across the industry to bring different perspectives and expertise to our events.</p>{collaborators.length?<div className="mt-8 grid gap-10 sm:grid-cols-2">{collaborators.map(p=><Profile key={p.id} person={p}/>)}</div>:<p className="mt-6 text-sm text-white/50">Approved collaborator profiles will appear here.</p>}</div></div></PageSection>
 <PageSection className="bg-[#172b31]"><div className="flex flex-wrap items-center justify-between gap-6"><div><h2 className="site-heading">Discover our community</h2><p className="mt-3 text-white/70">Meet the industry through our events and conversations.</p></div><Link to="/community" className="inline-flex min-h-11 items-center rounded bg-primary px-6 py-3 font-medium text-[#101d24]">Explore our community</Link></div></PageSection>
 </main><Footer hideAttendanceCTA/></div>;
}
