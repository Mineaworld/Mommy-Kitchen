alter table recipes
add column if not exists meal_slot text not null default 'any';

alter table recipes
drop constraint if exists recipes_meal_slot_check;

alter table recipes
add constraint recipes_meal_slot_check
check (meal_slot in ('breakfast', 'lunch', 'dinner', 'any'));

create index if not exists recipes_meal_slot_published_idx on recipes(meal_slot, is_published);
