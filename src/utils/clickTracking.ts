
import { supabase } from '@/integrations/supabase/client';

export const trackLinkClick = async (linkId: string): Promise<number> => {
  try {
    console.log('📊 Rastreando clique:', linkId);
    
    // Non-blocking analytics - execute the insert to get a proper Promise
    const insertQuery = supabase.from('clicks').insert({
      link_id: linkId,
      ip_hash: null,
      user_agent: navigator.userAgent,
      referer: document.referrer || null
    });

    // Handle the promise properly without blocking - convert to full Promise first
    Promise.resolve(insertQuery).then(() => {
      // Success - no action needed
    }).catch((error) => {
      console.warn('⚠️ Falha no tracking (não crítico):', error);
    });

    // Update click count
    const linkResponse = await supabase
      .from('links')
      .select('click_count')
      .eq('id', linkId)
      .single();

    if (linkResponse.data) {
      const newClickCount = (linkResponse.data.click_count || 0) + 1;
      
      await supabase
        .from('links')
        .update({ click_count: newClickCount })
        .eq('id', linkId);

      return newClickCount;
    }

    return 0;
  } catch (error) {
    console.error('❌ Erro no tracking:', error);
    return 0;
  }
};
