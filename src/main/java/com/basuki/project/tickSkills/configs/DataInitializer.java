package com.basuki.project.tickSkills.configs;

import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.SourcePlatform;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.Tag;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.entities.users.UserTypes;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.basuki.project.tickSkills.repository.questions.TagRepository;
import com.basuki.project.tickSkills.repository.users.UsersRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@ConditionalOnProperty(value = "tickskills.data.init.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

	private final CategoryRepository categoryRepository;
	private final TagRepository tagRepository;
	private final QuestionRepository questionRepository;
	private final UsersRepository usersRepository;

	public DataInitializer(CategoryRepository categoryRepository, TagRepository tagRepository, 
	                       QuestionRepository questionRepository, UsersRepository usersRepository) {
		this.categoryRepository = categoryRepository;
		this.tagRepository = tagRepository;
		this.questionRepository = questionRepository;
		this.usersRepository = usersRepository;
	}

	@Override
	public void run(String... args) throws Exception {
		// Create demo user if it doesn't exist
		createDemoUserIfNotExists();
		
		// Read JSON from etc/500_dsa_questions.json (workspace path)
		File file = new File("etc/500_dsa_questions.json");
		if (!file.exists()) {
			// attempt to load from classpath
			ClassPathResource r = new ClassPathResource("etc/500_dsa_questions.json");
			if (!r.exists()) return;
			try (InputStream is = r.getInputStream()) {
				seedFromStream(is);
			}
		} else {
			try (InputStream is = new java.io.FileInputStream(file)) {
				seedFromStream(is);
			}
		}
	}
	
	private void createDemoUserIfNotExists() {
		if (!usersRepository.existsByUsername("demo-user")) {
			Users demoUser = Users.builder()
					.username("demo-user")
					.name("Demo User")
					.email("demo@tickskills.com")
					.password("demo123") // In production, this should be hashed
					.userType(UserTypes.USER)
					.createdOn(LocalDateTime.now())
					.createdBy("system")
					.isDeleted(false)
					.build();
			usersRepository.save(demoUser);
			System.out.println("✓ Created demo user: demo-user");
		}
	}

	private void seedFromStream(InputStream is) throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		List<Map<String, Object>> items = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>(){});

		Map<String, Category> categoryCache = new HashMap<>();
		Map<String, Tag> tagCache = new HashMap<>();

		for (Map<String, Object> it : items) {
			String categoryName = (String) it.get("category");
			if (categoryName != null) {
				Category cat = categoryRepository.findByName(categoryName).orElseGet(() -> {
					Category c = new Category();
					c.setName(categoryName);
					return categoryRepository.save(c);
				});
				categoryCache.putIfAbsent(categoryName, cat);
			}

			Object tagsObj = it.get("tags");
			List<String> tags = new ArrayList<>();
			if (tagsObj instanceof List) {
				for (Object t : (List<?>) tagsObj) {
					if (t != null) tags.add(t.toString());
				}
			}

			Set<Tag> tagEntities = new HashSet<>();
			for (String tname : tags) {
				Tag tag = tagRepository.findByName(tname).orElseGet(() -> {
					Tag nt = new Tag(); 
					nt.setName(tname); 
					return tagRepository.save(nt);
				});
				tagEntities.add(tag);
				tagCache.putIfAbsent(tname, tag);
			}

			Question q = new Question();
			q.setTitle((String) it.get("title"));
			String diff = (String) it.get("difficulty");
			if (diff != null) {
				try {
					q.setDifficulty(Difficulty.valueOf(diff.toUpperCase()));
				} catch (Exception ignored) {}
			}
			String catName = (String) it.get("category");
			if (catName != null) {
				q.setCategory(categoryCache.get(catName));
			}
			String source = (String) it.get("source");
			if (source != null) {
				try { q.setSource(SourcePlatform.valueOf(source)); } catch (Exception ignored) {}
			}
			q.setExternalUrl((String) it.get("external_url"));
			Object ar = it.get("acceptance_rate");
			if (ar != null) {
				try { q.setAcceptanceRate(new BigDecimal(ar.toString())); } catch (Exception ignored) {}
			}
			q.setCompanies(it.get("companies") != null ? it.get("companies").toString() : null);
			q.setActive(it.get("is_active") == null ? true : Boolean.TRUE.equals(it.get("is_active")));
			q.setPremium(it.get("is_premium") == null ? false : Boolean.TRUE.equals(it.get("is_premium")));
			q.setTags(tagEntities);

			// avoid duplicates by title
			String title = q.getTitle();
			if (title != null && questionRepository.findByTitle(title).isPresent()) continue;
			questionRepository.save(q);
		}
	}
}

