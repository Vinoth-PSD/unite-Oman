--
-- PostgreSQL database dump
--

\restrict 0A3ncDkec0t4HPtC7vaAA5ggMC7t6vAmHbIEZkUkMrd5aD0yOfr5ICf11lHbBne

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: businessstatus; Type: TYPE; Schema: public; Owner: darshan
--

CREATE TYPE public.businessstatus AS ENUM (
    'pending',
    'active',
    'suspended',
    'rejected'
);


ALTER TYPE public.businessstatus OWNER TO darshan;

--
-- Name: listingtype; Type: TYPE; Schema: public; Owner: darshan
--

CREATE TYPE public.listingtype AS ENUM (
    'standard',
    'featured',
    'sponsored'
);


ALTER TYPE public.listingtype OWNER TO darshan;

--
-- Name: plantype; Type: TYPE; Schema: public; Owner: darshan
--

CREATE TYPE public.plantype AS ENUM (
    'basic',
    'professional',
    'enterprise'
);


ALTER TYPE public.plantype OWNER TO darshan;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: businesses; Type: TABLE; Schema: public; Owner: darshan
--

CREATE TABLE public.businesses (
    id uuid NOT NULL,
    name_en character varying(200) NOT NULL,
    name_ar character varying(200),
    slug character varying(200) NOT NULL,
    description text,
    short_description character varying(300),
    category_id integer,
    governorate_id integer,
    tags text[],
    phone character varying(20),
    whatsapp character varying(20),
    email character varying(200),
    website character varying(300),
    address text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    logo_url text,
    cover_image_url text,
    gallery_urls text[],
    status public.businessstatus,
    plan public.plantype,
    listing_type public.listingtype,
    is_verified boolean,
    is_featured boolean,
    business_hours jsonb,
    view_count integer,
    rating_avg numeric(3,2),
    rating_count integer,
    owner_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.businesses OWNER TO darshan;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: darshan
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    icon character varying(10),
    cover_image_url text,
    description text,
    business_count integer DEFAULT 0 NOT NULL,
    is_featured boolean,
    sort_order integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO darshan;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: darshan
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO darshan;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: darshan
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: governorates; Type: TABLE; Schema: public; Owner: darshan
--

CREATE TABLE public.governorates (
    id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    emoji character varying(10),
    business_count integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.governorates OWNER TO darshan;

--
-- Name: governorates_id_seq; Type: SEQUENCE; Schema: public; Owner: darshan
--

CREATE SEQUENCE public.governorates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.governorates_id_seq OWNER TO darshan;

--
-- Name: governorates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: darshan
--

ALTER SEQUENCE public.governorates_id_seq OWNED BY public.governorates.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: darshan
--

CREATE TABLE public.reviews (
    id uuid NOT NULL,
    business_id uuid,
    user_id uuid,
    reviewer_name character varying(100),
    rating integer,
    comment text,
    is_verified boolean,
    is_approved boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO darshan;

--
-- Name: services; Type: TABLE; Schema: public; Owner: darshan
--

CREATE TABLE public.services (
    id uuid NOT NULL,
    business_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    price character varying(100),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.services OWNER TO darshan;

--
-- Name: users; Type: TABLE; Schema: public; Owner: darshan
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(200) NOT NULL,
    password_hash character varying(200) NOT NULL,
    role character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO darshan;

--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: governorates id; Type: DEFAULT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.governorates ALTER COLUMN id SET DEFAULT nextval('public.governorates_id_seq'::regclass);


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: darshan
--

COPY public.businesses (id, name_en, name_ar, slug, description, short_description, category_id, governorate_id, tags, phone, whatsapp, email, website, address, latitude, longitude, logo_url, cover_image_url, gallery_urls, status, plan, listing_type, is_verified, is_featured, business_hours, view_count, rating_avg, rating_count, owner_id, created_at, updated_at) FROM stdin;
b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a3	Oman Bites Food Truck	عمان بايتس	oman-bites	Street food and fast food burgers.	Fast food and burgers	1	\N	{food,fastfood,burgers}	+968 99 123123	+968 99 123123	info@omanbites.com		Al Khuwair, Muscat	\N	\N	https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop	https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop	{https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1512413914561-12501a302638?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1508737804141-4c3b688e2546?q=80&w=800&auto=format&fit=crop}	active	basic	standard	f	f	{}	811	5.00	1	5cf58263-9f8b-40df-9f98-19005b69dacf	2026-03-13 16:26:28.601577+05:30	2026-03-15 12:32:13.128319+05:30
fce63e77-aad3-409c-b4e3-d73b91fe11d7	foodcafe	\N	foodcafe	\N	\N	1	3	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	active	basic	standard	f	f	{}	2	0.00	0	9d18cd48-8cab-423f-aa9d-76510588c254	2026-03-15 13:22:10.919107+05:30	2026-03-15 13:26:35.76635+05:30
b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a4	AutoCare Motors	العناية بالسيارات	autocare-motors	Full service car repair and maintenance.	Car repair and maintenance	2	\N	{cars,repair,maintenance}	+968 24 555555	+968 91 555555	support@autocare.om	https://autocare.om	Ruwi, Muscat	\N	\N	https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=200&auto=format&fit=crop	https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2000&auto=format&fit=crop	{https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1622321453982-1ebd92a2a7a4?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1579895066601-e23e2fb3eef1?q=80&w=800&auto=format&fit=crop}	active	professional	standard	t	f	{}	1221	4.00	2	cb34c71f-12c8-44b4-afff-e497949af7f8	2026-03-13 16:26:28.601577+05:30	2026-03-15 12:32:13.128319+05:30
b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a5	Al Maha Medical Center	مركز المها الطبي	al-maha-medical	Specialized medical clinics and pharmacy.	Clinics and Pharmacy	4	\N	{health,clinic,pharmacy}	+968 24 888888	+968 92 888888	contact@almaha.om	https://almaha.om	Bousher, Muscat	\N	\N	https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=200&auto=format&fit=crop	/images/gallery/al-maha-medical/lobby.png	{/images/gallery/al-maha-medical/lobby.png}	active	enterprise	featured	t	t	{}	4543	5.00	2	577cdc46-66fc-4df6-ae40-854b9272158f	2026-03-13 16:26:28.601577+05:30	2026-03-15 12:32:13.128319+05:30
85b3c79d-f2ef-45c9-b134-15938dd0561c	clothing store		final-car-wash			3	2	{}	9715078103	12345678	cloth@gmail.com			\N	\N	http://localhost:8000/uploads/8b1d2f76-4706-443b-ba30-07440dd7e29d.jpg	http://localhost:8000/uploads/69de1990-0d61-4535-b74e-907dcbeea45e.jpg	{http://localhost:8000/uploads/adf05bd0-b150-497a-8b79-a4a8a842a60c.jpg,http://localhost:8000/uploads/b1a6dd7a-4e27-4a9e-9073-481cea1bc730.jpg,http://localhost:8000/uploads/7bbd9a25-1a3d-47c1-bf59-5b19ee039a0b.jpg}	active	basic	standard	t	f	{"friday": {"open": "09:00", "close": "18:00", "closed": false}, "monday": {"open": "09:00", "close": "18:00", "closed": false}, "sunday": {"open": "09:00", "close": "18:00", "closed": false}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "09:00", "close": "18:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}}	51	4.00	2	663ba31e-cd9f-4ed7-a909-b8c3430e052c	2026-03-14 15:49:53.813159+05:30	2026-03-15 13:24:17.468223+05:30
b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1	Grand Oman Hotel	فندق عمان الكبير	grand-oman-hotel	Luxury stay in the heart of Muscat.	5-star luxury hotel	5	\N	{hotel,stay,luxury}	+968 24 123456	+968 91234567	contact@grandoman.com	https://grandoman.com	Muscat, Oman	\N	\N	https://images.unsplash.com/photo-1542314831-c6a4d4047338?q=80&w=200&auto=format&fit=crop	https://images.unsplash.com/photo-1542314831-c6a4d4047338?q=80&w=2000&auto=format&fit=crop	{https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop}	active	enterprise	sponsored	t	t	{"friday": {"open": "02:00 PM", "close": "11:00 PM"}, "monday": {"open": "08:00 AM", "close": "10:00 PM"}, "sunday": {"open": "08:00 AM", "close": "10:00 PM"}, "tuesday": {"open": "08:00 AM", "close": "10:00 PM"}, "saturday": {"open": "08:00 AM", "close": "11:00 PM"}, "thursday": {"open": "08:00 AM", "close": "10:00 PM"}, "wednesday": {"open": "08:00 AM", "close": "10:00 PM"}}	1515	4.00	5	d256570e-f5b2-4146-816b-3819234ec753	2026-03-13 16:26:28.601577+05:30	2026-03-15 12:33:04.469936+05:30
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: darshan
--

COPY public.categories (id, name_en, name_ar, slug, icon, cover_image_url, description, business_count, is_featured, sort_order, created_at) FROM stdin;
1	Restaurants	مطاعم	restaurants	🍔	https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop	Find the best dining spots and cafes.	2	t	1	2026-03-13 16:11:18.344839+05:30
2	Automotive	السيارات	automotive	🚗	https://images.unsplash.com/photo-1550305080-4cf019fab0c0?q=80&w=2000&auto=format&fit=crop	Car dealerships, rentals, and repair shops.	1	t	2	2026-03-13 16:11:18.344839+05:30
3	Retail & Shopping	التجزئة والتسوق	retail	🛍️	https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop	Malls, supermarkets, and local stores.	0	t	3	2026-03-13 16:11:18.344839+05:30
4	Health & Medical	الصحة والطب	health	🏥	https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop	Hospitals, clinics, and pharmacies.	1	t	4	2026-03-13 16:11:18.344839+05:30
5	Real Estate	عقارات	real-estate	🏢	https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop	Properties for rent, sale, and real estate agencies.	1	t	5	2026-03-13 16:11:18.344839+05:30
6	IT & Software	تقنية المعلومات	it-software	💻	https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop	Tech companies, software development, and IT services.	0	f	6	2026-03-13 16:11:18.344839+05:30
\.


--
-- Data for Name: governorates; Type: TABLE DATA; Schema: public; Owner: darshan
--

COPY public.governorates (id, name_en, name_ar, slug, emoji, business_count, created_at) FROM stdin;
1	Muscat	مسقط	muscat	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
2	Dhofar	ظفار	dhofar	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
3	Musandam	مسندم	musandam	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
4	Al Buraymi	البريمي	al-buraymi	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
5	Ad Dakhiliyah	الداخلية	ad-dakhiliyah	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
6	Al Batinah North	شمال الباطنة	al-batinah-north	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
7	Al Batinah South	جنوب الباطنة	al-batinah-south	🇴��	0	2026-03-13 17:21:49.25146+05:30
8	Ash Sharqiyah North	شمال الشرقية	ash-sharqiyah-north	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
9	Ash Sharqiyah South	جنوب الشرقية	ash-sharqiyah-south	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
10	Adh Dhahirah	الظاهرة	adh-dhahirah	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
11	Al Wusta	الوسطى	al-wusta	🇴🇲	0	2026-03-13 17:21:49.25146+05:30
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: darshan
--

COPY public.reviews (id, business_id, user_id, reviewer_name, rating, comment, is_verified, is_approved, created_at) FROM stdin;
aba8184e-37eb-4d26-8694-283737e49420	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1	\N	Ahmed S.	5	Absolutely magnificent experience! The views from the room were breathtaking and the staff was extremely accommodating.	\N	t	2026-03-11 16:30:09.611524+05:30
91ee8878-ad2d-41fe-ae02-f7b8c9a77122	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1	\N	Fatima A.	4	Very comfortable stay at Grand Oman. The breakfast buffet could use a bit more variety, but overall it was a great experience.	\N	t	2026-03-08 16:30:09.611524+05:30
af84e93b-5e63-43b8-b21a-4c5e2c835758	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1	\N	rr	5	rrr	f	t	2026-03-13 17:54:32.648604+05:30
173066c3-fecc-4173-b1b1-9a02840d3c48	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1	\N	rrrrr	1	rrrr	f	t	2026-03-13 17:54:42.660639+05:30
6bdf1690-3295-4ffa-a2f0-b0a9e95644eb	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a1	\N	rrr	5	rr	f	t	2026-03-13 17:54:46.83149+05:30
ab160dc9-4b85-416a-ac22-680ce457b838	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a5	\N	darshan	5	1	f	t	2026-03-13 19:02:14.25238+05:30
c6310133-b422-4fdd-9fc2-af5b04473278	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a5	\N	darshan	5	13e	f	t	2026-03-13 19:02:58.115863+05:30
651148d1-5d0a-4cea-b6e5-9f89bc4f2638	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a4	\N	mjio	3	superj	f	t	2026-03-13 19:08:11.65396+05:30
5d3c9c2c-f624-4d7c-9ecf-c986591a25fa	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a4	\N	dev	5	best	f	t	2026-03-13 19:08:28.279147+05:30
abbfbbc1-3d89-40e9-9767-f56daf7171cc	b1d7d3d7-4b2a-4a5e-b9e4-c9f28c24f6a3	\N	test	5	sb	f	t	2026-03-14 10:24:43.786364+05:30
eba0a6cc-7746-4e95-b3f6-d7d6bba2d0b5	85b3c79d-f2ef-45c9-b134-15938dd0561c	\N	rjr	5	jf	f	t	2026-03-14 17:15:24.631259+05:30
7cc7b889-bb24-472d-9af4-08258f933ee8	85b3c79d-f2ef-45c9-b134-15938dd0561c	\N	n 	3	j3	f	t	2026-03-14 17:15:36.206199+05:30
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: darshan
--

COPY public.services (id, business_id, name, description, price, created_at) FROM stdin;
d0e956d0-8db1-4050-9855-a5236ff4aa49	85b3c79d-f2ef-45c9-b134-15938dd0561c	car wash	g	5omr	2026-03-14 17:10:07.421496+05:30
990b1a8c-e4d6-475c-9989-ec38a1c7eb7a	85b3c79d-f2ef-45c9-b134-15938dd0561c	bike wash	clean and good	10omr 	2026-03-14 17:14:58.12557+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: darshan
--

COPY public.users (id, email, password_hash, role, created_at, is_active) FROM stdin;
c19f8d81-27bf-40ff-9688-3d381094b267	shop1@gmail.com	$2b$12$8AkaKCz4U8fr9L333aIZkuMygoM7XG/RAN8X32CBCh3wRpwOykh8a	vendor	2026-03-14 13:34:11.959544+05:30	f
663ba31e-cd9f-4ed7-a909-b8c3430e052c	final_car@example.com	$2b$12$wynmPAzr1J6hEeu1gpiWhOAasz1GsytYvQlKnE9niheiPrUbDFCXC	vendor	2026-03-14 15:49:53.813159+05:30	t
bf5b03cc-00fb-4850-a0a3-ba845053f8e7	john_final@example.com	$2b$12$YaH6einU41HSGjKpuBZJzOjJkbZA7hXAnofgj6Maa.G/wNCeQwXz.	vendor	2026-03-14 16:06:27.991459+05:30	t
9eeea122-aa24-4b23-841c-62f121c6a580	final_car@example.comjohn_final@example.com	$2b$12$r3AG.cnujUgnjwEq5pfivenkVNdhy5SxyJcZ7rKHV7BBxh6JcrIL2	vendor	2026-03-14 16:05:12.040411+05:30	t
f6136fed-f688-4a0c-8324-67677245cbf3	darshanshreedhev@gmail.com	$2b$12$Yxbq2CoVZsrwgvICePp.we6dUiE5PEBA57SE23sxBy4MSiIghrmz2	vendor	2026-03-14 16:06:44.864608+05:30	t
9559fcc1-acfb-4b64-be8b-dc48e25b83e9	shop3@gmail.com	$2b$12$cMuu/UZduKRHa0AOcjFV2.I3xqkO3ERoJ32oeBncxHr57fHZC2HXm	vendor	2026-03-14 13:47:23.078448+05:30	t
d256570e-f5b2-4146-816b-3819234ec753	hotel@unite.om	$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.	vendor	2026-03-15 12:32:13.128319+05:30	t
5cf58263-9f8b-40df-9f98-19005b69dacf	foodtruck@unite.om	$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.	vendor	2026-03-15 12:32:13.128319+05:30	t
577cdc46-66fc-4df6-ae40-854b9272158f	medical@unite.om	$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.	vendor	2026-03-15 12:32:13.128319+05:30	t
cb34c71f-12c8-44b4-afff-e497949af7f8	autocare@unite.om	$2b$12$6Lw2OitwBuDb6tipZ5Hsz.ZUmGmDkN0MClS/ezElUBtwCVtXSHRk.	vendor	2026-03-15 12:32:13.128319+05:30	t
9d18cd48-8cab-423f-aa9d-76510588c254	cafe@gmail.com	$2b$12$VKpw13f.W3a2j7.rrqP1yO9GVev.Ac79UbEAVhxwzqYspw7RMkxaq	vendor	2026-03-15 13:22:10.919107+05:30	t
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: darshan
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: governorates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: darshan
--

SELECT pg_catalog.setval('public.governorates_id_seq', 11, true);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_slug_key; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: governorates governorates_pkey; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.governorates
    ADD CONSTRAINT governorates_pkey PRIMARY KEY (id);


--
-- Name: governorates governorates_slug_key; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.governorates
    ADD CONSTRAINT governorates_slug_key UNIQUE (slug);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: businesses businesses_governorate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_governorate_id_fkey FOREIGN KEY (governorate_id) REFERENCES public.governorates(id);


--
-- Name: reviews reviews_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: services services_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: darshan
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE;


--
-- Name: SEQUENCE categories_id_seq; Type: ACL; Schema: public; Owner: darshan
--

GRANT ALL ON SEQUENCE public.categories_id_seq TO docpro_user;


--
-- Name: SEQUENCE governorates_id_seq; Type: ACL; Schema: public; Owner: darshan
--

GRANT ALL ON SEQUENCE public.governorates_id_seq TO docpro_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 0A3ncDkec0t4HPtC7vaAA5ggMC7t6vAmHbIEZkUkMrd5aD0yOfr5ICf11lHbBne

