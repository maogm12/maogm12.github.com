module TagPlugin
    class Generator < Jekyll::Generator
        def generate(site)
            all_existing_tags = Dir.entries("tag")
                .map { |t| t.match(/(.*).md/) }
                .compact
                .map { |m| m[1] }

            for post in site.posts.docs do
                tags = post['tags'].reject { |t| t.empty? }
                tags.each do |tag|
                    slug = custom_slugify tag
                    generate_tag_file(tag, slug) if !all_existing_tags.include?(slug)
                end
            end
        end

        def custom_slugify(str)
            Jekyll::Utils.slugify str.gsub('#', 'sharp').gsub('+', 'plus') 
        end

        def generate_tag_file(tag, slug)
            # generate tag file
            File.open("tag/#{slug}.md", "wb") do |file|
              file << 
"---
layout: tag
tag-name: #{tag}
---
"
            end
        end
    end
end