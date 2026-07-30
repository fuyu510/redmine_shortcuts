class ShortcutsHelpController < ApplicationController

  def index
    @text_formatting = Setting['text_formatting']
    render :layout => false
  end
end
