-- Fix Integrations Policies to allow INSERT and UPSERT
DROP POLICY IF EXISTS "Users can manage their own integrations" ON public.integrations;

CREATE POLICY "Users can manage their own integrations"
    ON public.integrations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Ensure users can also insert messages linked to their integrations
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
CREATE POLICY "Users can insert their own messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.integrations
            WHERE public.integrations.id = public.messages.integration_id
            AND public.integrations.user_id = auth.uid()
        )
    );
