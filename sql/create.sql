CREATE TABLE public.event_store (
	event_id varchar(36) NOT NULL,
	event_name varchar(100) NOT NULL,
	event_body json NOT NULL,
	"sequence" int8 NOT NULL DEFAULT 1,
	datetime date NOT NULL DEFAULT now()
)
WITH (
	OIDS=FALSE
) ;
